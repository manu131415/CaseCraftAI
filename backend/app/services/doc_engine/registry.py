from .exceptions import DocumentTypeNotSupported

from .generators.medical import MedicalGenerator
from .generators.remand import RemandGenerator
from .generators.chargesheet import ChargeSheetGenerator
from .generators.purvani import PurvaniGenerator
from .generators.seizure import SeizureGenerator
from .generators.panchanama import PanchnamaGenerator
from .generators.custody import CustodyGenerator
from .generators.face_identification import FaceIdentificationGenerator


class GeneratorRegistry:
    """
    Maps document types to generator classes.
    """

    _registry = {
        "medical": MedicalGenerator,
        "remand": RemandGenerator,
        "chargesheet": ChargeSheetGenerator,
        "purvani": PurvaniGenerator,
        "seizure": SeizureGenerator,
        "panchnama": PanchnamaGenerator,
        "custody": CustodyGenerator,
        "face_identification": FaceIdentificationGenerator,
    }

    @classmethod
    def get_generator(cls, document_type: str):
        """
        Returns an instance of the requested generator.
        """

        generator_class = cls._registry.get(document_type.lower())

        if generator_class is None:
            raise DocumentTypeNotSupported(document_type)

        return generator_class()

    @classmethod
    def supported_documents(cls):
        """
        Returns list of supported document types.
        """

        return sorted(cls._registry.keys())

    @classmethod
    def is_supported(cls, document_type: str) -> bool:
        """
        Check if document type is supported.
        """

        return document_type.lower() in cls._registry