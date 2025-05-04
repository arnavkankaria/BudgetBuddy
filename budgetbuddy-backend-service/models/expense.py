class Expense:
    def __init__(self, amount, category, date, method, notes=None):
        self.amount = amount
        self.category = category
        self.date = date
        self.method = method
        self.notes = notes
