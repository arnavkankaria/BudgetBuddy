class Expense:
    def __init__(self, amount, category, date, method, notes=None):
        self.amount = amount
        self.category = category
        self.date = date
        self.method = method
        self.notes = notes

    def to_dict(self):
        return {
            'amount': self.amount,
            'category': self.category,
            'date': self.date,
            'method': self.method,
            'notes': self.notes
        }
