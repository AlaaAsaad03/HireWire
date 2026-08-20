import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { MatchService } from '../match/match.service';
// @ts-ignore
import nlp from 'compromise';

export type EmailTone = 'professional' | 'warm' | 'enthusiastic' | 'concise';
export type EmailLength = 'short' | 'medium' | 'detailed';
export type EmailProvider = 'openai' | 'template';

export interface BaseEmailData {
    company: string;
    position: string;
    contactName?: string;
    tone?: EmailTone;
    length?: EmailLength;
    candidateName?: string;
    highlights?: string;
    extraContext?: string;
    nextStep?: string;
    jobDescription?: string;
}

export interface FollowUpEmailData extends BaseEmailData {
    appliedDate: string;
}

export interface ThankYouEmailData extends BaseEmailData {
    interviewerName?: string;
    interviewDate: string;
    keyTopics?: string;
}

export interface GeneratedEmailResult {
    subject: string;
    body: string;
    email: string;
    provider: EmailProvider;
}

export interface ParsedResumeExperience {
    company: string;
    position: string;
    location?: string;
    dates?: string;
    technologies?: string[];
}

export interface ParsedResumeEducation {
    degree: string;
    institution: string;
    location?: string;
    dates?: string;
}

export interface ParsedResumeResult {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: ParsedResumeExperience[];
    education: ParsedResumeEducation[];
    summary: string;
}

export interface JobAnalysisResult {
    requiredSkills: string[];
    preferredSkills: string[];
    experienceLevel: string;
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    recommendations: string;
    salaryRange: string | null;
}

@Injectable()
export class AiService {
    private openai?: OpenAI;

    constructor(
        private configService: ConfigService,
        private matchService: MatchService,
    ) { }

    async parseJobDescription(jobDescription: string) {
        console.log('\n========================================');
        console.log('🧠 SMART NLP JOB PARSER');
        console.log('========================================\n');

        const text = jobDescription.trim();
        const doc = nlp(text);

        console.log(`📄 Analyzing ${text.length} characters...\n`);

        // Extract using NLP
        const company = this.extractCompanyNLP(text, doc);
        const position = this.extractPositionNLP(text, doc);
        const location = this.extractLocationNLP(text, doc);
        const salary = this.extractSalaryNLP(text, doc);

        const result = { company, position, location, salary };

        console.log('\n========================================');
        console.log('✅ PARSING COMPLETE');
        console.log('========================================');
        console.log(JSON.stringify(result, null, 2));
        console.log('========================================\n');

        return result;
    }

    private extractCompanyNLP(text: string, doc: any): string {
        console.log('🏢 EXTRACTING COMPANY (NLP)...');

        // Method 1: Find "X is a/an" pattern
        const sentences = text.split(/[.!?]+/);
        for (const sentence of sentences.slice(0, 5)) {
            const match = sentence.match(/^([A-ZÀ-ÿ][A-Za-zÀ-ÿ\s&.'-]{1,50}?)\s+is\s+(?:a|an|the)\s+/);
            if (match) {
                console.log(`   ✅ Pattern match: "${match[1].trim()}"`);
                return match[1].trim();
            }
        }

        // Method 2: First capitalized phrase (organization)
        const orgs = doc.organizations().out('array');
        if (orgs.length > 0) {
            // CLEAN UP: Remove trailing comma or period
            let company = orgs[0].replace(/[.,]$/, '').trim();
            console.log(`   ✅ NLP organization: "${company}"`);
            return company;
        }

        // Method 3: First line if short and capitalized
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
            const firstLine = lines[0];
            if (firstLine.length >= 2 && firstLine.length <= 60 && /^[A-ZÀ-ÿ]/.test(firstLine)) {
                // Remove everything after " is "
                const cleaned = firstLine.split(' is ')[0].trim();
                console.log(`   ✅ First line: "${cleaned}"`);
                return cleaned;
            }
        }

        console.log('   ❌ Not found');
        return '';
    }

    private extractPositionNLP(text: string, doc: any): string {
        console.log('💼 EXTRACTING POSITION (NLP)...');

        const levels = ['Junior', 'Senior', 'Lead', 'Principal', 'Staff', 'Mid-level', 'Entry', 'Associate'];
        const specialties = ['Software', 'Product', 'Data', 'Full Stack', 'Full-Stack', 'Frontend', 'Front-end', 'Backend', 'Back-end', 'Mobile', 'Web', 'Cloud', 'DevOps', 'QA', 'UI/UX', 'UX', 'UI', 'Machine Learning', 'ML'];
        const roles = ['Developer', 'Engineer', 'Designer', 'Manager', 'Analyst', 'Specialist', 'Architect', 'Consultant', 'Administrator', 'Coordinator', 'Director', 'Scientist', 'Researcher', 'Programmer'];

        // Strategy 1: Find phrases with job verbs
        // Catch: "looking for", "seeking", "hiring", "need", "seek", "want", "require", etc.
        const jobVerbs = 'looking for|seeks?|seeking|hiring|recruiting|need|needs|want|wants|require|requires|is hiring|are hiring';
        const lookingMatch = text.match(new RegExp(`(?:${jobVerbs})\\s+(?:a|an)?\\s+(.{5,120}?)(?:\\s+to\\s+(?:join|support|work|lead|own)|,|\\.|\\n)`, 'i'));

        if (lookingMatch && lookingMatch[1]) {
            let phrase: string = lookingMatch[1].trim();
            console.log(`   📝 Raw phrase: "${phrase}"`);

            // Remove adjectives that come before the title
            const adjectives = ['motivated', 'talented', 'experienced', 'skilled', 'detail-oriented', 'passionate', 'creative', 'innovative', 'hardworking', 'dedicated', 'driven', 'self-motivated'];
            for (const adj of adjectives) {
                phrase = phrase.replace(new RegExp(`\\b${adj}\\s+and\\s+`, 'i'), '');
                phrase = phrase.replace(new RegExp(`\\b${adj}\\s+`, 'i'), '');
            }
            phrase = phrase.trim();
            console.log(`   🧹 Cleaned phrase: "${phrase}"`);

            // Try patterns in order of specificity (longest first)
            const titlePatterns = [
                // [Level] [Specialty] [Role] - e.g., "Senior Product Manager"
                new RegExp(`((?:${levels.join('|')})\\s+(?:${specialties.join('|')})\\s+(?:${roles.join('|')}))`, 'i'),
                // [Specialty] [Role] - e.g., "Data Scientist"
                new RegExp(`((?:${specialties.join('|')})\\s+(?:${roles.join('|')}))`, 'i'),
                // [Level] [Role] - e.g., "Senior Developer"
                new RegExp(`((?:${levels.join('|')})\\s+(?:${roles.join('|')}))`, 'i'),
                // Just [Role] - e.g., "Scientist"
                new RegExp(`(${roles.join('|')})`, 'i'),
            ];

            for (const pattern of titlePatterns) {
                const match = phrase.match(pattern);
                if (match && match[1]) {
                    const title: string = match[1].trim();
                    console.log(`   ✅ Matched: "${title}"`);
                    return title;
                }
            }
        }

        console.log('   ❌ Not found');
        return '';
    }

    private extractLocationNLP(text: string, doc: any): string {
        console.log('📍 EXTRACTING LOCATION (NLP)...');

        // Method 1: Explicit "Location:" label
        const labelMatch = text.match(/location[:\s]+([^\n.;]+)/i);
        if (labelMatch) {
            console.log(`   ✅ Label: "${labelMatch[1].trim()}"`);
            return labelMatch[1].trim();
        }

        // Method 2: Remote/Hybrid patterns
        const remoteMatch = text.match(/\b(Remote|Hybrid|On-site|Onsite|Work from home|WFH)\b/i);
        if (remoteMatch) {
            console.log(`   ✅ Work mode: "${remoteMatch[1]}"`);
            return remoteMatch[1];
        }

        // Method 3: Use NLP to find places
        const places = doc.places().out('array');
        if (places.length > 0) {
            console.log(`   ✅ NLP place: "${places[0]}"`);
            return places[0];
        }

        // Method 4: City, State/Country patterns
        const cityMatch = text.match(/\b([A-Z][a-z]+),\s*([A-Z]{2,}[a-z]*)\b/);
        if (cityMatch) {
            const location = `${cityMatch[1]}, ${cityMatch[2]}`;
            console.log(`   ✅ Pattern: "${location}"`);
            return location;
        }

        console.log('   ❌ Not found');
        return '';
    }

    private extractSalaryNLP(text: string, doc: any): number | null {
        console.log('💰 EXTRACTING SALARY (NLP)...');

        // Method 1: $XXX,XXX
        const dollarMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})+)/);
        if (dollarMatch) {
            const salary = parseFloat(dollarMatch[1].replace(/,/g, ''));
            if (salary >= 20000 && salary <= 1000000) {
                console.log(`   ✅ Found: $${salary.toLocaleString()}`);
                return salary;
            }
        }

        // Method 2: XXXk
        const kMatch = text.match(/\$?\s*(\d{2,3})k\b/i);
        if (kMatch) {
            const salary = parseFloat(kMatch[1]) * 1000;
            if (salary >= 20000 && salary <= 500000) {
                console.log(`   ✅ Found: $${salary.toLocaleString()}`);
                return salary;
            }
        }

        // Method 3: Use NLP to find money/values
        const money = doc.money().out('array');
        if (money.length > 0) {
            const value = money[0].replace(/[^0-9]/g, '');
            const salary = parseFloat(value);
            if (salary >= 20000 && salary <= 1000000) {
                console.log(`   ✅ NLP money: $${salary.toLocaleString()}`);
                return salary;
            }
        }

        console.log('   ❌ Not found');
        return null;
    }

    async parseResume(resumeText: string): Promise<ParsedResumeResult> {
        const text = this.normalizeText(resumeText);
        const lines = this.getMeaningfulLines(text);
        const skills = this.matchService.extractSkillsFromText(text);

        return {
            name: this.extractResumeName(lines),
            email: this.extractEmail(text),
            phone: this.extractPhone(text),
            skills,
            experience: this.extractResumeExperience(lines),
            education: this.extractResumeEducation(lines),
            summary: this.extractSectionText(text, 'SUMMARY', ['PROFESSIONAL EXPERIENCE', 'EXPERIENCE', 'PROJECTS', 'EDUCATION', 'SKILLS']),
        };
    }

    async analyzeJobDescription(jobDescription: string, userSkills: string[]): Promise<JobAnalysisResult> {
        const requiredSkills = this.matchService.extractJobSkills(jobDescription);
        const normalizedUserSkills = this.matchService.normalizeSkills(userSkills);
        const matchResult = this.matchService.calculateMatch(normalizedUserSkills, requiredSkills);

        return {
            requiredSkills,
            preferredSkills: this.extractPreferredSkills(jobDescription, requiredSkills),
            experienceLevel: this.extractExperienceLevel(jobDescription),
            matchScore: matchResult.matchScore,
            matchingSkills: matchResult.matchingSkills,
            missingSkills: matchResult.missingSkills,
            recommendations: this.buildJobRecommendation(matchResult.matchScore, matchResult.missingSkills),
            salaryRange: this.extractSalaryRange(jobDescription),
        };
    }

    private normalizeText(text: string): string {
        return (text || '')
            .replace(/\r/g, '\n')
            .replace(/[•●▪]/g, '-')
            .replace(/\u00a0/g, ' ')
            .replace(/[ \t]+/g, ' ')
            .trim();
    }

    private getMeaningfulLines(text: string): string[] {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && line.toLowerCase() !== 'paste your resume text');
    }

    private extractResumeName(lines: string[]): string {
        const ignoredPrefixes = ['address:', 'email:', 'phone', 'summary', 'professional experience'];
        const firstLikelyName = lines.find(line => {
            const lower = line.toLowerCase();
            return (
                line.length <= 80 &&
                !ignoredPrefixes.some(prefix => lower.startsWith(prefix)) &&
                !line.includes('|') &&
                !line.includes('@') &&
                /^[A-Za-z][A-Za-z\s.'-]+$/.test(line)
            );
        });

        return firstLikelyName || '';
    }

    private extractEmail(text: string): string {
        return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
    }

    private extractPhone(text: string): string {
        return text.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/)?.[0]?.trim() || '';
    }

    private extractSectionText(text: string, sectionName: string, stopSections: string[]): string {
        const sectionRegex = new RegExp(`${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n(?:${stopSections.join('|')})\\b|$)`, 'i');
        return sectionRegex.exec(text)?.[1]?.trim().replace(/\n+/g, ' ') || '';
    }

    private extractResumeExperience(lines: string[]): ParsedResumeExperience[] {
        const experiences: ParsedResumeExperience[] = [];
        const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}(?:\s*(?:-|to|–|—|â€“)\s*(?:Present|Current|(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}))?/i;

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            if (!line.includes('|') || !datePattern.test(line)) {
                continue;
            }

            const [positionPart, detailsPart] = line.split('|').map(part => part.trim());
            const dates = detailsPart.match(datePattern)?.[0];
            const companyAndLocation = dates ? detailsPart.replace(dates, '').trim() : detailsPart;
            const [company, location] = companyAndLocation
                .split(/\s+(?:-|–|—|â€“)\s+|,\s+/)
                .map(part => part.trim())
                .filter(Boolean);
            const nearbyText = lines.slice(index, Math.min(index + 8, lines.length)).join('\n');

            experiences.push({
                company: company || companyAndLocation,
                position: positionPart,
                location,
                dates,
                technologies: this.extractTechnologiesFromNearbyText(nearbyText),
            });
        }

        return experiences.slice(0, 8);
    }

    private extractResumeEducation(lines: string[]): ParsedResumeEducation[] {
        const education: ParsedResumeEducation[] = [];
        const educationStart = lines.findIndex(line => /^EDUCATION$/i.test(line));
        if (educationStart === -1) {
            return education;
        }

        for (const line of lines.slice(educationStart + 1, educationStart + 8)) {
            if (/^(SKILLS|CERTIFICATES|PROJECTS)$/i.test(line)) {
                break;
            }

            if (!line.includes('|')) {
                continue;
            }

            const [degree, details] = line.split('|').map(part => part.trim());
            const dates = details.match(/\b(?:19|20)\d{2}\b.*$/)?.[0];
            const detailsWithoutDates = dates ? details.replace(dates, '').trim() : details;
            const [institution, location] = detailsWithoutDates.split(/\s+(?:-|–|—|â€“)\s+|,\s+/).map(part => part.trim());

            education.push({
                degree,
                institution: institution || detailsWithoutDates,
                location,
                dates,
            });
        }

        return education;
    }

    private extractTechnologiesFromNearbyText(text: string): string[] {
        const technologiesLine = text
            .split('\n')
            .find(line => /technologies(?: used)?:/i.test(line));

        return this.matchService.extractSkillsFromText(technologiesLine || text);
    }

    private extractPreferredSkills(jobDescription: string, requiredSkills: string[]): string[] {
        const preferredSection = this.extractSectionText(jobDescription, '(?:Preferred|Nice to have|Bonus)', [
            'Requirements',
            'Responsibilities',
            'Qualifications',
            'Benefits',
            'About',
        ]);

        if (!preferredSection) {
            return [];
        }

        return this.matchService
            .extractSkillsFromText(preferredSection)
            .filter(skill => !requiredSkills.includes(skill));
    }

    private extractExperienceLevel(jobDescription: string): string {
        const text = jobDescription.toLowerCase();
        const yearMatch = text.match(/(\d+)\+?\s*(?:years|yrs)/i);

        if (/\b(intern|internship|entry[-\s]?level|junior)\b/.test(text)) {
            return 'Entry';
        }

        if (/\b(lead|principal|staff|architect|manager)\b/.test(text)) {
            return 'Senior';
        }

        if (yearMatch) {
            const years = Number(yearMatch[1]);
            if (years >= 5) return 'Senior';
            if (years >= 2) return 'Mid';
            return 'Entry';
        }

        if (/\b(senior|sr\.)\b/.test(text)) {
            return 'Senior';
        }

        return 'Mid';
    }

    private extractSalaryRange(jobDescription: string): string | null {
        const range = jobDescription.match(/\$?\s?\d{2,3}(?:,\d{3})?\s?(?:k|K)?\s*(?:-|to|–|—)\s*\$?\s?\d{2,3}(?:,\d{3})?\s?(?:k|K)?/);
        if (range) {
            return range[0].trim();
        }

        const single = jobDescription.match(/\$\s?\d{2,3}(?:,\d{3})+|\$?\s?\d{2,3}\s?k\b/i);
        return single?.[0]?.trim() || null;
    }

    private buildJobRecommendation(score: number, missingSkills: string[]): string {
        if (score >= 85) {
            return 'Strong match. You meet nearly all detected requirements, so tailor your application around the matching skills and relevant project outcomes.';
        }

        if (score >= 65) {
            return missingSkills.length > 0
                ? `Good match. Highlight your matching skills and briefly address these gaps: ${missingSkills.join(', ')}.`
                : 'Good match. The description has broad requirements, and your listed skills cover the detected technologies well.';
        }

        if (score >= 40) {
            return `Moderate match. Focus your application on the strongest overlaps and consider strengthening: ${missingSkills.join(', ') || 'the missing requirements'}.`;
        }

        return `Low match based on detected skills. This may still be worth applying to if your experience covers the role, but the missing skills are: ${missingSkills.join(', ') || 'not clearly detected'}.`;
    }

    async generateFollowUpEmail(data: FollowUpEmailData): Promise<GeneratedEmailResult> {
        const normalized = this.normalizeEmailData(data);
        const prompt = this.buildFollowUpPrompt(normalized as FollowUpEmailData);
        const aiEmail = await this.generateEmailWithOpenAI(prompt);

        if (aiEmail) {
            return this.formatEmailResult(aiEmail.subject, aiEmail.body, 'openai');
        }

        const fallback = this.buildFollowUpFallback(normalized as FollowUpEmailData);
        return this.formatEmailResult(fallback.subject, fallback.body, 'template');
    }

    async generateThankYouEmail(data: ThankYouEmailData): Promise<GeneratedEmailResult> {
        const normalized = this.normalizeEmailData(data);
        const prompt = this.buildThankYouPrompt(normalized as ThankYouEmailData);
        const aiEmail = await this.generateEmailWithOpenAI(prompt);

        if (aiEmail) {
            return this.formatEmailResult(aiEmail.subject, aiEmail.body, 'openai');
        }

        const fallback = this.buildThankYouFallback(normalized as ThankYouEmailData);
        return this.formatEmailResult(fallback.subject, fallback.body, 'template');
    }

    private normalizeEmailData<T extends BaseEmailData>(data: T): T {
        return {
            ...data,
            company: this.cleanText(data.company) || 'the company',
            position: this.cleanText(data.position) || 'the role',
            contactName: this.cleanText(data.contactName),
            tone: data.tone || 'professional',
            length: data.length || 'medium',
            candidateName: this.cleanText(data.candidateName),
            highlights: this.cleanText(data.highlights),
            extraContext: this.cleanText(data.extraContext),
            nextStep: this.cleanText(data.nextStep),
            jobDescription: this.cleanText(data.jobDescription),
        };
    }

    private async generateEmailWithOpenAI(prompt: string): Promise<{ subject: string; body: string } | null> {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            return null;
        }

        try {
            if (!this.openai) {
                this.openai = new OpenAI({ apiKey });
            }

            const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
            const completion = await this.openai.chat.completions.create({
                model,
                temperature: 0.7,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You write concise, specific job-search emails. Return only valid JSON with "subject" and "body" string fields. Do not include markdown.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                return null;
            }

            return this.parseGeneratedEmail(content);
        } catch (error) {
            console.error('OpenAI email generation failed:', error);
            return null;
        }
    }

    private buildFollowUpPrompt(data: FollowUpEmailData): string {
        return JSON.stringify({
            task: 'Write a follow-up email for a job application.',
            constraints: [
                'Use a natural, human tone.',
                'Keep it specific to the role and company.',
                'Do not invent facts, names, interview details, or dates.',
                'Include a clear but low-pressure closing question.',
            ],
            context: {
                company: data.company,
                position: data.position,
                appliedDate: data.appliedDate,
                recipientName: data.contactName,
                candidateName: data.candidateName,
                tone: data.tone,
                length: data.length,
                highlights: data.highlights,
                extraContext: data.extraContext,
                nextStep: data.nextStep,
                jobDescription: this.truncate(data.jobDescription, 1200),
            },
        });
    }

    private buildThankYouPrompt(data: ThankYouEmailData): string {
        return JSON.stringify({
            task: 'Write a thank-you email after a job interview.',
            constraints: [
                'Sound appreciative and specific, not generic.',
                'Mention only interview topics provided by the user.',
                'Reaffirm interest in the role.',
                'Do not invent facts, names, interview details, or dates.',
            ],
            context: {
                company: data.company,
                position: data.position,
                interviewDate: data.interviewDate,
                recipientName: data.interviewerName || data.contactName,
                candidateName: data.candidateName,
                tone: data.tone,
                length: data.length,
                keyTopics: data.keyTopics,
                highlights: data.highlights,
                extraContext: data.extraContext,
                nextStep: data.nextStep,
                jobDescription: this.truncate(data.jobDescription, 1200),
            },
        });
    }

    private buildFollowUpFallback(data: FollowUpEmailData): { subject: string; body: string } {
        const greeting = this.greeting(data.contactName);
        const signoff = this.signoff(data.candidateName);
        const appliedDate = data.appliedDate ? ` on ${this.formatDate(data.appliedDate)}` : '';
        const subject = `Following up on ${data.position} application`;
        const intro = `I hope you're doing well. I wanted to follow up on my application for the ${data.position} role at ${data.company}${appliedDate}.`;
        const interest = this.toneSentence(data.tone as EmailTone, data.company, data.position);
        const highlights = data.highlights
            ? `I also wanted to briefly highlight ${this.lowercaseFirst(data.highlights)}.`
            : `The role feels like a strong fit for my background, and I would be glad to share any additional details that would be helpful.`;
        const context = data.extraContext ? `\n\n${data.extraContext}` : '';
        const close = data.nextStep
            ? `If there is any update on ${this.lowercaseFirst(data.nextStep)}, I would be grateful to hear it.`
            : `If there are any updates on the process or anything else I can provide, I would be happy to help.`;

        return {
            subject,
            body: this.composeBody(data.length as EmailLength, [
                greeting,
                intro,
                interest,
                highlights,
                context.trim(),
                close,
                signoff,
            ]),
        };
    }

    private buildThankYouFallback(data: ThankYouEmailData): { subject: string; body: string } {
        const recipient = data.interviewerName || data.contactName;
        const greeting = this.greeting(recipient);
        const signoff = this.signoff(data.candidateName);
        const interviewDate = data.interviewDate ? ` on ${this.formatDate(data.interviewDate)}` : '';
        const subject = `Thank you for the ${data.position} interview`;
        const intro = `Thank you for taking the time to speak with me about the ${data.position} role at ${data.company}${interviewDate}.`;
        const topics = data.keyTopics
            ? `I especially appreciated the conversation around ${this.lowercaseFirst(data.keyTopics)}.`
            : `I appreciated learning more about the team, the role, and the problems this position will help solve.`;
        const highlights = data.highlights
            ? `Our conversation reinforced how my experience with ${this.lowercaseFirst(data.highlights)} could contribute to the team.`
            : `The conversation made me even more interested in the opportunity and the impact of the work.`;
        const context = data.extraContext ? `\n\n${data.extraContext}` : '';
        const close = data.nextStep
            ? `I look forward to ${this.lowercaseFirst(data.nextStep)}.`
            : `I appreciate your consideration and look forward to any next steps.`;

        return {
            subject,
            body: this.composeBody(data.length as EmailLength, [
                greeting,
                intro,
                topics,
                highlights,
                context.trim(),
                close,
                signoff,
            ]),
        };
    }

    private parseGeneratedEmail(content: string): { subject: string; body: string } | null {
        try {
            const parsed = JSON.parse(content);
            if (typeof parsed.subject === 'string' && typeof parsed.body === 'string') {
                return {
                    subject: parsed.subject.trim(),
                    body: parsed.body.trim(),
                };
            }
        } catch {
            const subjectMatch = content.match(/subject[:\s]+(.+)/i);
            const subject = subjectMatch?.[1]?.trim() || 'Job Application Follow-Up';
            const body = content
                .replace(/```json|```/g, '')
                .replace(/subject[:\s]+.+/i, '')
                .trim();

            if (body) {
                return { subject, body };
            }
        }

        return null;
    }

    private formatEmailResult(subject: string, body: string, provider: EmailProvider): GeneratedEmailResult {
        const cleanSubject = subject.trim();
        const cleanBody = body.trim();

        return {
            subject: cleanSubject,
            body: cleanBody,
            email: `Subject: ${cleanSubject}\n\n${cleanBody}`,
            provider,
        };
    }

    private composeBody(length: EmailLength, parts: string[]): string {
        const filtered = parts.filter((part) => part && part.trim().length > 0);

        if (length === 'short') {
            return [filtered[0], `${filtered[1]} ${filtered[filtered.length - 2]}`, filtered[filtered.length - 1]]
                .filter(Boolean)
                .join('\n\n');
        }

        if (length === 'detailed') {
            return filtered.join('\n\n');
        }

        const [greeting, intro, ...rest] = filtered;
        const signoff = rest.pop();
        return [greeting, `${intro} ${rest.filter(Boolean).join(' ')}`, signoff].filter(Boolean).join('\n\n');
    }

    private toneSentence(tone: EmailTone, company: string, position: string): string {
        switch (tone) {
            case 'warm':
                return `I remain very interested in the opportunity and appreciated the chance to learn more about ${company}.`;
            case 'enthusiastic':
                return `I am excited about the possibility of contributing to ${company} in the ${position} role.`;
            case 'concise':
                return `I remain interested in the role and wanted to check in on the process.`;
            default:
                return `I remain interested in the opportunity and the chance to contribute to ${company}.`;
        }
    }

    private greeting(name?: string): string {
        return name ? `Dear ${name},` : 'Dear Hiring Team,';
    }

    private signoff(candidateName?: string): string {
        return candidateName ? `Best regards,\n${candidateName}` : 'Best regards,';
    }

    private cleanText(value?: string): string | undefined {
        if (!value) {
            return undefined;
        }

        return value.replace(/\s+/g, ' ').trim() || undefined;
    }

    private lowercaseFirst(value: string): string {
        return value.charAt(0).toLowerCase() + value.slice(1);
    }

    private truncate(value?: string, maxLength = 1000): string | undefined {
        if (!value || value.length <= maxLength) {
            return value;
        }

        return `${value.slice(0, maxLength)}...`;
    }

    private formatDate(value: string): string {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}
