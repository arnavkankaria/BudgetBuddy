class AuthValidator:

    @staticmethod
    def validate_registration_input(data):
        required_fields = ["email", "password"]
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"

        if len(data["password"]) < 6:
            return False, "Password must be at least 6 characters long"

        return True, "Valid"
