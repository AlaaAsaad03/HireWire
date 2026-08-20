import { Injectable } from '@nestjs/common';

export interface SkillDefinition {
  name: string;
  aliases: string[];
}

export interface MatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  { name: 'JavaScript', aliases: ['javascript', 'js'] },
  { name: 'TypeScript', aliases: ['typescript', 'ts'] },
  { name: 'React', aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Next.js', aliases: ['next.js', 'nextjs', 'next'] },
  { name: 'Angular', aliases: ['angular', 'angularjs'] },
  { name: 'Vue', aliases: ['vue', 'vue.js', 'vuejs'] },
  { name: 'Svelte', aliases: ['svelte'] },
  { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Express', aliases: ['express', 'express.js', 'expressjs'] },
  { name: 'NestJS', aliases: ['nestjs', 'nest.js', 'nest js'] },
  { name: 'Python', aliases: ['python', 'py'] },
  { name: 'Django', aliases: ['django'] },
  { name: 'Flask', aliases: ['flask'] },
  { name: 'Java', aliases: ['java'] },
  { name: 'Spring', aliases: ['spring', 'spring boot'] },
  { name: 'C#', aliases: ['c#', 'csharp', 'c sharp'] },
  { name: '.NET', aliases: ['.net', 'dotnet', '.net core', 'asp.net', 'asp.net core', 'ado.net'] },
  { name: 'PHP', aliases: ['php'] },
  { name: 'SQL', aliases: ['sql'] },
  { name: 'MySQL', aliases: ['mysql'] },
  { name: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'] },
  { name: 'SQL Server', aliases: ['sql server', 'mssql', 'ssms'] },
  { name: 'MongoDB', aliases: ['mongodb', 'mongo', 'mongodb atlas'] },
  { name: 'Redis', aliases: ['redis'] },
  { name: 'Supabase', aliases: ['supabase'] },
  { name: 'TypeORM', aliases: ['typeorm'] },
  { name: 'Entity Framework', aliases: ['entity framework', 'ef core'] },
  { name: 'Dapper', aliases: ['dapper'] },
  { name: 'SQLAlchemy', aliases: ['sqlalchemy'] },
  { name: 'GraphQL', aliases: ['graphql'] },
  { name: 'REST API', aliases: ['rest api', 'rest apis', 'restful api', 'restful apis'] },
  { name: 'WebSockets', aliases: ['websocket', 'websockets', 'socket.io', 'socketio'] },
  { name: 'AWS', aliases: ['aws', 'amazon web services'] },
  { name: 'Azure', aliases: ['azure', 'microsoft azure'] },
  { name: 'GCP', aliases: ['gcp', 'google cloud'] },
  { name: 'Docker', aliases: ['docker', 'containers', 'containerization'] },
  { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { name: 'Git', aliases: ['git', 'github', 'gitlab'] },
  { name: 'CI/CD', aliases: ['ci/cd', 'continuous integration', 'continuous delivery'] },
  { name: 'HTML', aliases: ['html', 'html5'] },
  { name: 'CSS', aliases: ['css', 'css3'] },
  { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwind css'] },
  { name: 'Bootstrap', aliases: ['bootstrap'] },
  { name: 'Material UI', aliases: ['material ui', 'mui'] },
  { name: 'Sass', aliases: ['sass', 'scss'] },
  { name: 'Framer Motion', aliases: ['framer motion'] },
  { name: 'GSAP', aliases: ['gsap'] },
  { name: 'Vite', aliases: ['vite'] },
  { name: 'Jest', aliases: ['jest'] },
  { name: 'Testing', aliases: ['testing', 'unit testing', 'integration testing'] },
  { name: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { name: 'AI', aliases: ['ai', 'artificial intelligence', 'llm', 'llms'] },
  { name: 'Data Science', aliases: ['data science'] },
  { name: 'Data Analytics', aliases: ['data analytics'] },
  { name: 'Deep Learning', aliases: ['deep learning'] },
  { name: 'TensorFlow', aliases: ['tensorflow'] },
  { name: 'PyTorch', aliases: ['pytorch'] },
  { name: 'Pandas', aliases: ['pandas'] },
  { name: 'NumPy', aliases: ['numpy'] },
  { name: 'JWT', aliases: ['jwt', 'json web token'] },
  { name: 'OAuth', aliases: ['oauth', 'google oauth'] },
  { name: 'Agile', aliases: ['agile', 'scrum', 'kanban'] },
  { name: 'Full Stack', aliases: ['full stack', 'full-stack', 'fullstack'] },
  { name: 'Frontend', aliases: ['frontend', 'front-end', 'front end'] },
  { name: 'Backend', aliases: ['backend', 'back-end', 'back end'] },
  { name: 'DevOps', aliases: ['devops'] },
  { name: 'UI/UX', aliases: ['ui/ux', 'ux', 'ui'] },
  { name: 'Product Management', aliases: ['product management'] },
  { name: 'Project Management', aliases: ['project management'] },
  { name: 'Leadership', aliases: ['leadership', 'team lead'] },
  { name: 'Communication', aliases: ['communication'] },
  { name: 'Teamwork', aliases: ['teamwork', 'team collaboration'] },
];

@Injectable()
export class MatchService {
  /**
   * Calculate match score between user skills and job requirements
   */
  calculateMatch(userSkills: string[], jobSkills: string[]): MatchResult {
    if (!userSkills || userSkills.length === 0) {
      return {
        matchScore: 0,
        matchingSkills: [],
        missingSkills: jobSkills,
        recommendation: 'Add your skills to see job matches!',
      };
    }

    if (!jobSkills || jobSkills.length === 0) {
      return {
        matchScore: 100,
        matchingSkills: userSkills,
        missingSkills: [],
        recommendation: 'Perfect match! Apply now.',
      };
    }

    const normalizedUserSkills = this.normalizeSkills(userSkills);
    const normalizedJobSkills = this.normalizeSkills(jobSkills);

    if (normalizedJobSkills.length === 0) {
      return {
        matchScore: 100,
        matchingSkills: normalizedUserSkills,
        missingSkills: [],
        recommendation: 'Perfect match! Apply now.',
      };
    }

    // Find matching skills
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const jobSkill of normalizedJobSkills) {
      const isMatched = normalizedUserSkills.some(userSkill =>
        this.skillsMatch(userSkill, jobSkill)
      );

      if (isMatched) {
        matchingSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    }

    // Calculate percentage
    const matchScore = Math.round((matchingSkills.length / normalizedJobSkills.length) * 100);

    // Generate recommendation
    const recommendation = this.getRecommendation(matchScore);

    return {
      matchScore,
      matchingSkills,
      missingSkills,
      recommendation,
    };
  }

  /**
   * Check if two skills are similar (handles variations)
   */
  private skillsMatch(userSkill: string, jobSkill: string): boolean {
    // Exact match
    if (userSkill === jobSkill) return true;

    // Handle common variations
    const variations: { [key: string]: string[] } = {
      'javascript': ['js', 'nodejs', 'node.js', 'node'],
      'typescript': ['ts'],
      'react': ['reactjs', 'react.js'],
      'next.js': ['nextjs', 'next'],
      'angular': ['angularjs'],
      'vue': ['vuejs', 'vue.js'],
      'node.js': ['nodejs', 'node', 'javascript', 'js'],
      'nestjs': ['nest.js', 'nest js'],
      'python': ['py'],
      'java': ['jvm'],
      'csharp': ['c#', '.net'],
      '.net': ['csharp', 'c#', 'dotnet', '.net core', 'asp.net', 'asp.net core', 'ado.net'],
      'sql': ['mysql', 'postgresql', 'mssql', 'sqlite', 'pl/sql'],
      'postgresql': ['postgres', 'psql', 'sql'],
      'sql server': ['mssql', 'ssms', 'sql'],
      'mongodb': ['mongo', 'nosql'],
      'websockets': ['websocket', 'socket.io', 'socketio'],
      'docker': ['containers', 'containerization'],
      'kubernetes': ['k8s', 'orchestration'],
      'aws': ['amazon', 'cloud'],
      'azure': ['microsoft', 'cloud'],
      'gcp': ['google cloud', 'cloud'],
      'rest api': ['api', 'rest', 'http'],
      'graphql': ['api', 'graph'],
      'git': ['github', 'gitlab', 'version control'],
      'ci/cd': ['continuous integration', 'jenkins', 'gitlab ci'],
      'machine learning': ['ml', 'ai', 'deep learning'],
      'full stack': ['full-stack', 'fullstack'],
      'frontend': ['front-end', 'ui', 'client-side'],
      'backend': ['back-end', 'server-side', 'api'],
    };

    // Check variations
    for (const [key, synonyms] of Object.entries(variations)) {
      if (userSkill === key && (jobSkill === key || synonyms.includes(jobSkill))) {
        return true;
      }
      if (jobSkill === key && (userSkill === key || synonyms.includes(userSkill))) {
        return true;
      }
    }

    // Partial match (e.g., "react" matches "reactjs")
    if (userSkill.length > 3 && jobSkill.includes(userSkill)) return true;
    if (jobSkill.length > 3 && userSkill.includes(jobSkill)) return true;

    return false;
  }

  /**
   * Get recommendation based on match score
   */
  private getRecommendation(score: number): string {
    if (score >= 80) {
      return '🟢 Strong fit! You meet most requirements. Apply with confidence!';
    }
    if (score >= 60) {
      return '🟡 Good fit. Highlight your transferable skills and willingness to learn.';
    }
    if (score >= 40) {
      return '🟠 Moderate fit. Focus on your strongest matching skills in your application.';
    }
    return '🔴 Low fit. Consider roles that better match your current skillset, or learn the missing skills first.';
  }

  /**
   * Extract job skills from job description
   */
  extractJobSkills(jobDescription: string): string[] {
    return this.extractSkillsFromText(jobDescription);
  }

  extractSkillsFromText(text: string): string[] {
    const foundSkills: string[] = [];

    for (const skill of SKILL_DEFINITIONS) {
      if (skill.aliases.some(alias => this.textContainsSkill(text, alias))) {
        foundSkills.push(skill.name);
      }
    }

    return [...new Set(foundSkills)];
  }

  normalizeSkills(skills: string[]): string[] {
    const normalized = skills.flatMap(skill => {
      const matchedDefinition = SKILL_DEFINITIONS.find(definition =>
        definition.name.toLowerCase() === skill.toLowerCase().trim() ||
        definition.aliases.some(alias => this.textContainsSkill(skill, alias))
      );

      return matchedDefinition ? [matchedDefinition.name] : [skill.trim()];
    }).filter(Boolean);

    return [...new Set(normalized)];
  }

  private textContainsSkill(text: string, skill: string): boolean {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (skill.length <= 2) {
      return new RegExp(`(^|[\\s,;/()])${escaped}($|[\\s,;/()])`, 'i').test(text);
    }

    const boundary = /^[a-z0-9]/i.test(skill) && /[a-z0-9]$/i.test(skill)
      ? `\\b${escaped}\\b`
      : escaped;

    return new RegExp(boundary, 'i').test(text);
  }
}
