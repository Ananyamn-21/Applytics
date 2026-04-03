import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer-core';
import { TailoredResume } from '../ai/ai.service.js';
import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';

@Injectable()
export class ResumeGeneratorService {
    private readonly logger = new Logger(ResumeGeneratorService.name);
    private readonly baseUploadsDir = path.join(process.cwd(), 'uploads');
    private readonly templateDir = path.join(
        this.baseUploadsDir,
        'resume_templates',
    );
    private readonly outputDir = path.join(
        this.baseUploadsDir,
        'generated_resumes',
    );

    constructor() {
        this.ensureDirectoriesExist();
        this.registerHandlebarsHelpers();
    }

    private ensureDirectoriesExist() {
        [this.templateDir, this.outputDir].forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.logger.log(`Created directory: ${dir}`);
            }
        });

        // Create a default simple template if none exists
        const defaultTemplatePath = path.join(this.templateDir, 'default.html');
        if (!fs.existsSync(defaultTemplatePath)) {
            this.createDefaultTemplate(defaultTemplatePath);
        }
    }

    private registerHandlebarsHelpers() {
        Handlebars.registerHelper('join', function (array: string[], sep: string) {
            return array && array.length > 0 ? array.join(sep) : '';
        });
    }

    /**
     * Generates a tailored PDF resume using an HTML template and Puppeteer.
     * @returns the absolute file path of the generated PDF
     */
    async generatePdfResume(
        user: User,
        job: Job,
        tailoredData: TailoredResume | null,
        templateName = 'default.html',
    ): Promise<string | null> {
        if (!tailoredData) {
            this.logger.warn(
                `No tailored data provided for ${user.email} - skipping PDF generation`,
            );
            return null;
        }

        const templatePath = path.join(this.templateDir, templateName);
        if (!fs.existsSync(templatePath)) {
            this.logger.error(`Template not found at: ${templatePath}`);
            return null;
        }

        try {
            this.logger.log(
                `Generating PDF resume for ${user.email} -> ${job.title}...`,
            );

            // 1. Read and compile the HTML template
            const templateHtml = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = Handlebars.compile(templateHtml);

            // 2. Map data to the template
            const templateData = {
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: process.env.USER_PHONE || '(555) 123-4567', // Fallback config
                },
                job: {
                    title: job.title,
                    company: job.company,
                },
                resume: tailoredData,
            };

            const finalHtml = compiledTemplate(templateData);

            // 3. Launch Puppeteer browser to render perfectly formatted PDF
            // Using standard chromium executable format expected by puppeteer-core on Mac
            const browser = await puppeteer.launch({
                executablePath:
                    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                headless: 'new' as any,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();

            // Load the injected HTML
            await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

            const outputFileName = `${user.id}_${job.id}_${Date.now()}.pdf`;
            const outputFilePath = path.join(this.outputDir, outputFileName);

            // Render to PDF
            await page.pdf({
                path: outputFilePath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.4in',
                    right: '0.4in',
                    bottom: '0.4in',
                    left: '0.4in',
                },
            });

            await browser.close();

            this.logger.log(
                `Successfully generated resume PDF at: ${outputFilePath}`,
            );
            return outputFilePath;
        } catch (error) {
            this.logger.error(
                'Failed to generate PDF resume',
                error instanceof Error ? error.stack : error,
            );
            return null;
        }
    }

    private createDefaultTemplate(filepath: string) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{user.firstName}} {{user.lastName}} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 13.5px;
      color: #000;
      background: #fff;
      padding: 36px 52px;
      max-width: 820px;
      margin: 0 auto;
    }

    /* ── HEADER ── */
    .header {
      text-align: center;
      margin-bottom: 6px;
    }

    .header h1 {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 22pt;
      font-weight: bold;
      color: #404040;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }

    .contact-info {
      font-size: 11.5px;
      color: #000;
      margin-top: 2px;
    }

    .contact-info a {
      color: #1054CC;
      text-decoration: none;
    }

    /* ── SECTION HEADINGS ── */
    h2 {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12.5px;
      font-weight: bold;
      color: #404040;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 0.8px solid #999;
      padding-bottom: 1px;
      margin-top: 14px;
      margin-bottom: 7px;
    }

    /* ── SUMMARY ── */
    .summary {
      font-size: 12.5px;
      line-height: 1.55;
      color: #000;
      margin-bottom: 2px;
    }

    /* ── EXPERIENCE / PROJECT BLOCK ── */
    .block {
      margin-bottom: 12px;
    }

    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .block-company {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12.5px;
      font-weight: bold;
      color: #000;
    }

    .block-location {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12px;
      color: #000;
    }

    .block-subheader {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 1px;
      margin-bottom: 3px;
    }

    .block-role {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 11px;
      font-weight: bold;
      color: #000;
    }

    .block-date {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12px;
      color: #000;
    }

    /* ── BULLETS ── */
    ul {
      list-style: none;
      padding-left: 0;
      margin: 2px 0 0 0;
    }

    ul li {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12.5px;
      color: #000;
      line-height: 1.5;
      padding-left: 14px;
      position: relative;
      margin-bottom: 2px;
    }

    ul li::before {
      content: "●";
      position: absolute;
      left: 0;
      font-size: 7px;
      top: 4px;
      color: #000;
    }

    /* ── EDUCATION ── */
    .edu-block {
      margin-bottom: 10px;
    }

    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .edu-institution {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12.5px;
      font-weight: bold;
      color: #000;
    }

    .edu-location {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12px;
      color: #000;
    }

    .edu-subheader {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 1px;
    }

    .edu-degree {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12.5px;
      font-weight: bold;
      color: #000;
    }

    .edu-year {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12px;
      color: #000;
    }

    /* ── SKILLS ── */
    .skills-block {
      font-family: 'Garamond', 'EB Garamond', Georgia, serif;
      font-size: 12.5px;
      color: #000;
      line-height: 1.6;
    }

    .skills-block p {
      margin-bottom: 2px;
    }

    .skills-block strong {
      font-weight: bold;
      color: #000;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <h1>{{user.firstName}} {{user.lastName}}</h1>
    <div class="contact-info">
      P: {{user.phone}} | <a href="mailto:{{user.email}}">{{user.email}}</a> | <a href="{{user.linkedin}}">LinkedIn</a> | <a href="{{user.github}}">GitHub</a>
    </div>
  </div>

  <!-- PROFESSIONAL SUMMARY -->
  <h2>Professional Summary</h2>
  <div class="summary">{{resume.summary}}</div>

  <!-- EXPERIENCE -->
  <h2>Experience</h2>
  {{#each resume.experiences}}
  <div class="block">
    <div class="block-header">
      <span class="block-company">{{this.company}}</span>
      <span class="block-location">{{this.location}}</span>
    </div>
    <div class="block-subheader">
      <span class="block-role">{{this.role}}</span>
      <span class="block-date">{{this.duration}}</span>
    </div>
    <ul>
      {{#each this.bullets}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/each}}

  <!-- EDUCATION -->
  <h2>Education</h2>
  {{#each resume.education}}
  <div class="edu-block">
    <div class="edu-header">
      <span class="edu-institution">{{this.institution}}</span>
      <span class="edu-location">{{this.location}}</span>
    </div>
    <div class="edu-subheader">
      <span class="edu-degree">{{this.degree}}</span>
      <span class="edu-year">{{this.year}}</span>
    </div>
  </div>
  {{/each}}

  <!-- PROJECTS -->
  <h2>Projects</h2>
  {{#each resume.projects}}
  <div class="block">
    <div class="block-header">
      <span class="block-company">{{this.name}}</span>
      <span class="block-date">{{this.date}}</span>
    </div>
    <ul>
      {{#each this.bullets}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/each}}

  <!-- TECHNICAL SKILLS -->
  <h2>Technical Skills</h2>
  <div class="skills-block">
    {{#each resume.skillCategories}}
      <p><strong>{{this.category}}:</strong> {{this.skills}}</p>
    {{/each}}
  </div>

</body>
</html>
    `;
        fs.writeFileSync(filepath, html.trim(), 'utf8');
        this.logger.log('Created default HTML resume template');
    }
}
