const sortedConversation = (conversationsData) => {
  // Sort conversations by 'updated_at' in descending order
  const sortedConversations = [...conversationsData.results].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );
  return sortedConversations[0] || null;
};

export default sortedConversation;