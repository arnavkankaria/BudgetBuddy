import unittest
import json
from unittest.mock import patch
from app import app

class TestExpenseIntegration(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Mock Firebase authentication
        self.firebase_patcher = patch('firebase_admin.auth.verify_id_token')
        self.mock_verify_id_token = self.firebase_patcher.start()
        self.mock_verify_id_token.return_value = {'uid': 'test-user-id'}

    def tearDown(self):
        self.firebase_patcher.stop()

    def test_create_expense(self):
        """Test creating a new expense."""
        test_expense = {
            "amount": 50.00,
            "category": "Food",
            "date": "2024-03-20",
            "method": "Credit Card",
            "notes": "Lunch"
        }
        
        response = self.app.post(
            '/expenses/',
            data=json.dumps(test_expense),
            content_type='application/json',
            headers={'Authorization': 'Bearer test-token'}
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["message"], "Expense added")

    def test_get_expenses(self):
        """Test retrieving expenses."""
        response = self.app.get(
            '/expenses/',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)

    def test_update_expense(self):
        """Test updating an existing expense."""
        # First create an expense
        test_expense = {
            "amount": 50.00,
            "category": "Food",
            "date": "2024-03-20",
            "method": "Credit Card",
            "notes": "Lunch"
        }
        
        create_response = self.app.post(
            '/expenses/',
            data=json.dumps(test_expense),
            content_type='application/json',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(create_response.status_code, 201)
        # Get the expense id from the list
        list_response = self.app.get(
            '/expenses/',
            headers={'Authorization': 'Bearer test-token'}
        )
        expense_list = json.loads(list_response.data)
        expense_id = expense_list[-1]['id']
        
        # Update the expense
        updated_expense = {
            "amount": 60.00,
            "category": "Food",
            "date": "2024-03-20",
            "method": "Credit Card",
            "notes": "Dinner"
        }
        
        response = self.app.put(
            f'/expenses/{expense_id}',
            data=json.dumps(updated_expense),
            content_type='application/json',
            headers={'Authorization': 'Bearer test-token'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["message"], "Expense updated")

    def test_delete_expense(self):
        """Test deleting an expense."""
        # First create an expense
        test_expense = {
            "amount": 50.00,
            "category": "Food",
            "date": "2024-03-20",
            "method": "Credit Card",
            "notes": "Lunch"
        }
        
        create_response = self.app.post(
            '/expenses/',
            data=json.dumps(test_expense),
            content_type='application/json',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(create_response.status_code, 201)
        # Get the expense id from the list
        list_response = self.app.get(
            '/expenses/',
            headers={'Authorization': 'Bearer test-token'}
        )
        expense_list = json.loads(list_response.data)
        expense_id = expense_list[-1]['id']
        
        # Delete the expense
        response = self.app.delete(
            f'/expenses/{expense_id}',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["message"], "Expense deleted")
        
        # Verify it's deleted
        get_response = self.app.get(
            f'/expenses/{expense_id}',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(get_response.status_code, 404)

    def test_get_single_expense(self):
        """Test retrieving a single expense by ID."""
        # Create an expense with a unique amount
        test_expense = {
            "amount": 75.50,  # Using a unique amount to identify our expense
            "category": "Transport",
            "date": "2024-03-21",
            "method": "Cash",
            "notes": "Taxi ride to airport"
        }
        create_response = self.app.post(
            '/expenses/',
            data=json.dumps(test_expense),
            content_type='application/json',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(create_response.status_code, 201)
        
        # Get the expense id from the list
        list_response = self.app.get(
            '/expenses/',
            headers={'Authorization': 'Bearer test-token'}
        )
        expense_list = json.loads(list_response.data)
        
        # Find our expense by the unique amount
        our_expense = next((exp for exp in expense_list if exp['amount'] == test_expense['amount']), None)
        self.assertIsNotNone(our_expense, "Could not find our test expense in the list")
        expense_id = our_expense['id']

        # Retrieve the expense by ID
        get_response = self.app.get(
            f'/expenses/{expense_id}',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(get_response.status_code, 200)
        data = json.loads(get_response.data)
        self.assertEqual(data['id'], expense_id)
        self.assertEqual(data['amount'], test_expense['amount'])
        self.assertEqual(data['category'], 'Transport')
        self.assertEqual(data['method'], 'Cash')
        self.assertEqual(data['notes'], 'Taxi ride to airport')

        # Try to get a non-existent expense
        bad_response = self.app.get(
            '/expenses/nonexistentid',
            headers={'Authorization': 'Bearer test-token'}
        )
        self.assertEqual(bad_response.status_code, 404)

if __name__ == '__main__':
    unittest.main() 