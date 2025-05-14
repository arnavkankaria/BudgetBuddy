class RecurringExpense:
    def __init__(self, amount, category, frequency, start_date, end_date=None, notes=None):
        self.amount = amount
        self.category = category
        self.frequency = frequency  # daily, weekly, monthly, yearly
        self.start_date = start_date
        self.end_date = end_date
        self.notes = notes

    def to_dict(self):
        return {
            'amount': self.amount,
            'category': self.category,
            'frequency': self.frequency,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'notes': self.notes
        } 