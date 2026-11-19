
const extractResumeData = (text) => {
  // Extract email address
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  )

  // Extract phone number
  const phoneMatch = text.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}/
  )

  // Identify common technical skills
  const skillList = [
    'Java',
    'Python',
    'JavaScript',
    'React',
    'Node.js',
    'Express.js',
    'SQL',
    'MySQL',
    'MongoDB',
    'HTML',
    'CSS',
    'C++',
    'C',
    'DSA',
    'OOP',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
    'Git',
    'GitHub',
    'SAP',
    'ABAP',
  ]

  const skills = skillList.filter((skill) => {
    const regex = new RegExp(
      `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    )

    return regex.test(text)
  })

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    skills,
  }
}

module.exports = extractResumeData
