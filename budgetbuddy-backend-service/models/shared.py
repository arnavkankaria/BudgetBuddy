class SharedExpense:
    def __init__(self, expense_id, user_ids, splits):
        self.expense_id = expense_id  # ID of the main expense
        self.user_ids = user_ids      # list of user UIDs
        self.splits = splits          # dict: {uid: share_amount}
