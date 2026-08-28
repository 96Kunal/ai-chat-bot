import { CollegeKnowledge, ICollegeKnowledge } from '../models/CollegeKnowledge';

export const findRelevantKnowledge = async (query: string): Promise<ICollegeKnowledge[]> => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = query.toLowerCase();
  const keywords = cleanQuery.split(/\s+/).filter((w) => w.length > 2);

  try {
    // 1. First attempt text search if index exists
    const textMatches = await CollegeKnowledge.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(4);

    if (textMatches && textMatches.length > 0) {
      return textMatches;
    }

    // 2. Keyword regex fallback
    const regexConditions = keywords.map((k) => ({
      $or: [
        { title: { $regex: k, $options: 'i' } },
        { content: { $regex: k, $options: 'i' } },
        { tags: { $in: [new RegExp(k, 'i')] } },
      ],
    }));

    if (regexConditions.length > 0) {
      const regexMatches = await CollegeKnowledge.find({ $or: regexConditions }).limit(4);
      return regexMatches;
    }

    return [];
  } catch (error) {
    // In case text index is not ready in memory store, fallback to regex search
    try {
      const regexConditions = keywords.map((k) => ({
        $or: [
          { title: { $regex: k, $options: 'i' } },
          { content: { $regex: k, $options: 'i' } },
          { tags: { $in: [new RegExp(k, 'i')] } },
        ],
      }));
      if (regexConditions.length > 0) {
        return await CollegeKnowledge.find({ $or: regexConditions }).limit(4);
      }
    } catch (fallbackErr) {
      console.error('[KnowledgeService] Search fallback error:', fallbackErr);
    }
    return [];
  }
};

export const formatKnowledgeContext = (items: ICollegeKnowledge[]): string => {
  if (!items || items.length === 0) {
    return '';
  }

  let formatted = '### OFFICIAL VERIFIED COLLEGE KNOWLEDGE BASE:\n';
  items.forEach((item, index) => {
    formatted += `\n[Source ${index + 1}: ${item.title} (Category: ${item.category})]\n${item.content}\n`;
  });
  return formatted;
};
