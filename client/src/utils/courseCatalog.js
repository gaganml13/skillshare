const courseKey = (course, index, prefix) => {
  if (!course) return `${prefix || 'course'}-${index}`;
  return course._id || course.id || course.slug || `${prefix || 'course'}-${index}`;
};

export const mergeCourses = (seedCourses = [], fetchedCourses = []) => {
  const merged = new Map();
  seedCourses.forEach((course, index) => {
    merged.set(courseKey(course, index, 'seed'), course);
  });
  fetchedCourses.forEach((course, index) => {
    const key = courseKey(course, index, 'live');
    const existing = merged.get(key) || {};
    merged.set(key, { ...existing, ...course });
  });
  return Array.from(merged.values());
};

export default { mergeCourses };
