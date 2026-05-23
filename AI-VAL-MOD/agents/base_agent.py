from states.startup_state import StartupState


class BaseAgent:

    def run(self, state: StartupState) -> StartupState:
        raise NotImplementedError("Agent must implement run()")
