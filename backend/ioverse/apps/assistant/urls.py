from django.urls import path
from .views.assistant import (
    AssistantCreateView,
    AssistantListView,
    AssistantRetrieveView,
    AssistantUpdateView,
    AssistantDeleteView
)
from .views.thread import (
    ThreadCreateView,
    ThreadRetrieveView,
    ThreadUpdateView,
    ThreadListView,
    ThreadDeleteView
)
from .views.message import (
    MessageCreateView,
    MessageListView,
    MessageRetrieveView,
    MessageUpdateView,
    MessageDeleteView
)
from .views.vectorstore import (
    VectorStoreCreateView,
    VectorStoreListView,
    VectorStoreRetrieveView,
    VectorStoreUpdateView,
    VectorStoreDeleteView,
    VectorStoreStatusStreamView
)
from .views.vectorstorefile import (
    VectorStoreFileCreateView,
    VectorStoreFileListView,
    VectorStoreFileRetrieveView,
    VectorStoreFileDeleteView
)
from .views.file import (
    FileCreateView,
    FileListView,
    FileRetrieveView,
    FileDeleteView
)
from .views.run import RunAPIView , RunStepAPIView
from .views.vectorstorebatch import VectorStoreBacthCreateView, VectorStoreBatchStatusStreamView
from .views.generate import GenerateSystemInstruction, GenerateFunction, GenerateSchema
from .views.image_retrieve import ImageRetrieveView

urlpatterns = [
    # Assistant
    path('create/', AssistantCreateView.as_view(), name='assistant-create'),
    path('list/', AssistantListView.as_view(), name='assistant-list'),
    path('<str:assistant_id>/retrieve/', AssistantRetrieveView.as_view(), name='assistant-retrieve'),
    path('<str:assistant_id>/update/', AssistantUpdateView.as_view(), name='assistant-update'),
    path('<str:assistant_id>/delete/', AssistantDeleteView.as_view(), name='assistant-delete'),
    # Thread
    path('thread/create/', ThreadCreateView.as_view(), name='thread-create'),
    path('thread/list/', ThreadListView.as_view(), name='thread-list'),
    path('thread/<str:thread_id>/retrieve/', ThreadRetrieveView.as_view(), name='thread-retrieve'),
    path('thread/<str:thread_id>/update/', ThreadUpdateView.as_view(), name='thread-update'),
    path('thread/<str:thread_id>/delete/', ThreadDeleteView.as_view(), name='thread-delete'),
    # Message
    path('message/<str:thread_id>/create/', MessageCreateView.as_view(), name='message-create'),
    path('message/<str:thread_id>/list/', MessageListView.as_view(), name='message-list'),
    path('message/<str:thread_id>/<str:message_id>/retrieve/', MessageRetrieveView.as_view(), name='message-retrieve'),
    path('message/<str:thread_id>/<str:message_id>/update/', MessageUpdateView.as_view(), name='message-update'),
    path('message/<str:thread_id>/<str:message_id>/delete/', MessageDeleteView.as_view(), name='message-delete'),
    # Vector Store
    path('vector_store/create/', VectorStoreCreateView.as_view(), name='vector_store-create'),
    path('vector_store/<str:vector_store_id>/status/', VectorStoreStatusStreamView.as_view(), name='vector_store-status'),
    path('vector_store/list/', VectorStoreListView.as_view(), name='vector_store-list'),
    path('vector_store/<str:vector_store_id>/retrieve/', VectorStoreRetrieveView.as_view(), name='vector_store-retrieve'),
    path('vector_store/<str:vector_store_id>/update/', VectorStoreUpdateView.as_view(), name='vector_store-update'),
    path('vector_store/<str:vector_store_id>/delete/', VectorStoreDeleteView.as_view(), name='vector_store-delete'),
    # Vector Store File
    path('vector_store_file/create/', VectorStoreFileCreateView.as_view(), name='vector_store_file-create'),
    path('vector_store_file/<str:vector_store_id>/list/', VectorStoreFileListView.as_view(), name='vector_store_file-list'),
    path('vector_store_file/<str:vector_store_file_id>/retrieve/', VectorStoreFileRetrieveView.as_view(), name='vector_store_file-retrieve'),
    path('vector_store_file/<str:vector_store_file_id>/delete/', VectorStoreFileDeleteView.as_view(), name='vector_store_file-delete'),
    # Vector Store Batch
    path('vector_store_batch/create/', VectorStoreBacthCreateView.as_view(), name='vector_store_batch-create'),
    path('vector_store_batch/<str:vector_store_id>/<str:batch_id>/status/', VectorStoreBatchStatusStreamView.as_view(), name='vector_store_batch-status'),
    # File
    path('file/create/', FileCreateView.as_view(), name='file-create'),
    path('file/list/', FileListView.as_view(), name='file-list'),
    path('file/<str:file_id>/retrieve/', FileRetrieveView.as_view(), name='file-retrieve'),
    path('file/<str:file_id>/delete/', FileDeleteView.as_view(), name='file-delete'),
    # Runs
    path('run/<str:action>/', RunAPIView.as_view(), name='run-actions'),
    # RunSteps
    path('run_steps/<str:action>/', RunStepAPIView.as_view(), name='runstep-actions'),
    # Generations
    path('generate/system_instructions/', GenerateSystemInstruction.as_view(), name='gen-system_instructions'),
    path('generate/function/', GenerateFunction.as_view(), name='gen-function'),
    path('generate/schema/', GenerateSchema.as_view(), name='gen-schema'),
    # File-related images
    path('file_image/<str:id>/retrieve/', ImageRetrieveView.as_view(), name='file_image-retrieve')
]
