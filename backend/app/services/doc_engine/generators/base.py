# app/services/doc_engine/generators/base.py

from abc import ABC, abstractmethod


class BaseGenerator(ABC):
    """
    Base class for all document generators.
    """

    template_name: str = ""

    @abstractmethod
    def build_context(self, context: dict) -> dict:
        """
        Modify or extend the common context for this document.

        Parameters
        ----------
        context : dict
            Common context built from database.

        Returns
        -------
        dict
            Updated context.
        """
        pass