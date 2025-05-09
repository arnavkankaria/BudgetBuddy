import spacy

class ExpenseClassifier:
    nlp = spacy.load("en_core_web_md")  # or _sm for lighter

    CATEGORY_DOCS = {
        "Transport": nlp("taxi uber bus fuel cab commute"),
        "Food": nlp("restaurant groceries snacks food delivery"),
        "Entertainment": nlp("netflix movies music games shows"),
        "Housing": nlp("rent loan emi mortgage utilities"),
    }

    @classmethod
    def classify(cls, description):
        doc = cls.nlp(description)
        best_score = -1
        best_cat = "Others"

        for cat, ref_doc in cls.CATEGORY_DOCS.items():
            score = doc.similarity(ref_doc)
            if score > best_score:
                best_score = score
                best_cat = cat

        return best_cat
