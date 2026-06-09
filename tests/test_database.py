import pytest
import os
import sqlite3
from database.database import LeadDatabase, LeadStatus

@pytest.fixture
def temp_db(tmp_path):
    db_file = tmp_path / "test_leads.db"
    db = LeadDatabase(str(db_file))
    yield db
    db.close()

def test_add_lead(temp_db):
    lead_id = temp_db.add_lead(
        business_name="Test Biz",
        industry="SaaS",
        location="Remote",
        email="test@example.com",
        website="https://example.com"
    )
    assert lead_id is not None
    
    lead = temp_db.get_lead_by_id(lead_id)
    assert lead["business_name"] == "Test Biz"
    assert lead["status"] == LeadStatus.SCRAPED

def test_duplicate_prevention(temp_db):
    lead_data = {
        "business_name": "Unique Biz",
        "industry": "Tech",
        "location": "NY",
        "email": "unique@example.com"
    }
    
    id1 = temp_db.add_lead(**lead_data)
    assert id1 is not None
    
    id2 = temp_db.add_lead(**lead_data)
    assert id2 is None  # Should be skipped

def test_update_status(temp_db):
    lead_id = temp_db.add_lead("Biz", "Ind", "Loc", "email@test.com")
    
    success = temp_db.update_status(lead_id, LeadStatus.SENT)
    assert success is True
    
    lead = temp_db.get_lead_by_id(lead_id)
    assert lead["status"] == LeadStatus.SENT
    assert lead["sent_at"] is not None

def test_get_leads_by_status(temp_db):
    temp_db.add_lead("Biz 1", "Ind", "Loc", "1@test.com", status=LeadStatus.SCRAPED)
    temp_db.add_lead("Biz 2", "Ind", "Loc", "2@test.com", status=LeadStatus.SENT)
    
    scraped = temp_db.get_leads_by_status(LeadStatus.SCRAPED)
    assert len(scraped) == 1
    assert scraped[0]["business_name"] == "Biz 1"

def test_stats(temp_db):
    temp_db.add_lead("Biz 1", "Ind", "Loc", "1@test.com", status=LeadStatus.SCRAPED)
    temp_db.add_lead("Biz 2", "Ind", "Loc", "2@test.com", status=LeadStatus.SENT)
    
    stats = temp_db.stats()
    assert stats["total"] == 2
    assert stats["by_status"][LeadStatus.SCRAPED] == 1
    assert stats["by_status"][LeadStatus.SENT] == 1

def test_search_leads(temp_db):
    temp_db.add_lead("Biz 1", "Industry A", "City X", "1@test.com")
    temp_db.add_lead("Biz 2", "Industry B", "City X", "2@test.com")
    temp_db.add_lead("Biz 3", "Industry A", "City Y", "3@test.com")
    
    # Search by industry
    results = temp_db.search_leads(industry="Industry A")
    assert len(results) == 2
    
    # Search by location
    results = temp_db.search_leads(location="City X")
    assert len(results) == 2
    
    # Search by both
    results = temp_db.search_leads(industry="Industry A", location="City X")
    assert len(results) == 1
    assert results[0]["business_name"] == "Biz 1"

def test_daily_sent_count(temp_db):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    # Add a lead sent today
    cursor = temp_db._conn.cursor()
    cursor.execute("""
        INSERT INTO leads (business_name, industry, location, email, status, sent_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, ("Sent Today", "Test", "Test", "today@test.com", LeadStatus.SENT, now))
    temp_db._conn.commit()
    
    assert temp_db.get_daily_sent_count() == 1
    
    # Add a lead sent yesterday
    yesterday = "2000-01-01 12:00:00"
    cursor.execute("""
        INSERT INTO leads (business_name, industry, location, email, status, sent_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, ("Sent Yesterday", "Test", "Test", "old@test.com", LeadStatus.SENT, yesterday))
    temp_db._conn.commit()
    
    # Should still be 1 for today
    assert temp_db.get_daily_sent_count() == 1
