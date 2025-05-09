class Budget:
    def __init__(self, category, amount, period='monthly', start_date=None, end_date=None):
        self.category = category
        self.amount = amount
        self.period = period
        self.start_date = start_date
        self.end_date = end_date

    def to_dict(self):
        return {
            'category': self.category,
            'amount': self.amount,
            'period': self.period,
            'start_date': self.start_date,
            'end_date': self.end_date
        }


