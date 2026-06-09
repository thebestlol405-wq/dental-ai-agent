import pytest
import sys
from main import parse_args

def test_parse_args_required():
    # Test that city and industry are required
    with patch("sys.argv", ["main.py"]):
        with pytest.raises(SystemExit):
            parse_args()

def test_parse_args_valid():
    with patch("sys.argv", ["main.py", "--city", "London", "--industry", "Coffee"]):
        args = parse_args()
        assert args.city == "London"
        assert args.industry == "Coffee"
        assert args.max_leads == 20  # Default value

def test_parse_args_custom():
    with patch("sys.argv", ["main.py", "--city", "NY", "--industry", "Gym", "--max-leads", "50", "--scrape-only"]):
        args = parse_args()
        assert args.city == "NY"
        assert args.industry == "Gym"
        assert args.max_leads == 50
        assert args.scrape_only is True

from unittest.mock import patch
