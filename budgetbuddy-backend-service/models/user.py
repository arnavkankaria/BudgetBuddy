class User:

    def __init__(self, uid, email, display_name=None):
        self.uid = uid
        self.email = email
        self.display_name = display_name

    def to_dict(self):
        return {
            'uid': self.uid,
            'email': self.email,
            'display_name': self.display_name
        }