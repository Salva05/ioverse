# Import models from each module to expose them at the package level
# and make Django be aware of them
from .assistant import Assistant
from .thread import Thread
from .message import Message
from .vectorstore import VectorStore
from .vectorstorefile import VectorStoreFile

__all__ = ['Assistant', 'Thread', 'Message', 'VectorStore', 'VectorStoreFile']