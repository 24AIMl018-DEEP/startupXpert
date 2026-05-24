class BaseAgent:

    def run(self, state: dict) -> dict:
        raise NotImplementedError("Service must implement run()")
