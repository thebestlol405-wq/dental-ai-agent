import pytest
from unittest.mock import MagicMock, patch
from sender.sender import EmailSender

@pytest.fixture
def sender(monkeypatch):
    # Mock environment variables for SMTP
    monkeypatch.setenv("SMTP_HOST", "smtp.test.com")
    monkeypatch.setenv("SMTP_USER", "user@test.com")
    monkeypatch.setenv("SMTP_PASS", "password")
    return EmailSender()

def test_render_template(sender):
    template = "Hello {{business_name}} from {{location}}"
    variables = {"business_name": "MyBiz", "location": "NYC"}
    rendered = sender._render_template(template, variables)
    assert rendered == "Hello MyBiz from NYC"

def test_load_template_default(sender):
    # Test that it returns default template if file doesn't exist
    with patch("os.path.exists", return_value=False):
        template = sender._load_template("non_existent.txt")
        assert "Hi {{business_name}}" in template

def test_build_message(sender):
    variables = {"industry": "Plumbing", "location": "LA"}
    # Mock _load_template to return a predictable string
    with patch.object(sender, '_load_template', return_value="Welcome to {{industry}} in {{location}}"):
        message = sender._build_message("to@test.com", "TargetBiz", variables)
        assert "Welcome to Plumbing in LA" in message

@patch("smtplib.SMTP")
def test_send_one_success(mock_smtp, sender):
    mock_server = MagicMock()
    sender._server = mock_server
    
    success = sender._send_one("target@test.com", "Body", "Subject")
    
    assert success is True
    mock_server.sendmail.assert_called_once()

@patch("smtplib.SMTP")
def test_send_one_failure(mock_smtp, sender):
    mock_server = MagicMock()
    mock_server.sendmail.side_effect = Exception("SMTP Error")
    sender._server = mock_server
    
    success = sender._send_one("target@test.com", "Body", "Subject")
    
    assert success is False

def test_daily_limit_logic(sender):
    # Mock daily sent count to be 29
    with patch("database.database.LeadDatabase") as mock_db_class:
        mock_db = mock_db_class.return_value
        mock_db.get_daily_sent_count.return_value = 29
        
        from sender.sender import send_pending_leads
        
        # Mock EmailSender to not actually connect/send
        with patch("sender.sender.EmailSender") as mock_sender_class:
            mock_sender_class.DAILY_LIMIT = 30
            mock_sender_instance = mock_sender_class.return_value.__enter__.return_value
            mock_sender_instance.send_leads.return_value = {"sent": 1, "failed": 0, "skipped_daily_limit": 0}
            
            # 1 lead available
            mock_db.get_leads_by_status.return_value = [{"id": 1, "email": "test@test.com"}]
            
            result = send_pending_leads(mock_db, limit=10)
            
            assert result["sent"] == 1
            # send_leads should have been called with daily_limit=1 (30-29)
            mock_sender_instance.send_leads.assert_called_once()
            args, kwargs = mock_sender_instance.send_leads.call_args
            assert kwargs["daily_limit"] == 1

def test_daily_limit_reached(sender):
    with patch("database.database.LeadDatabase") as mock_db_class:
        mock_db = mock_db_class.return_value
        mock_db.get_daily_sent_count.return_value = 30 # Limit reached
        
        from sender.sender import send_pending_leads
        
        result = send_pending_leads(mock_db, limit=10)
        assert result["sent"] == 0
        assert result["skipped_daily_limit"] == 0 # Function returns early
