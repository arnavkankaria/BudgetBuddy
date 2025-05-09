class Report:
    def __init__(self, month, total_spent, category_summary):
        self.month = month
        self.total_spent = total_spent
        self.category_summary = category_summary  # dict: {category: amount}

    def to_dict(self):
        return {
            'month': self.month,
            'total_spent': self.total_spent,
            'category_summary': self.category_summary
        }
