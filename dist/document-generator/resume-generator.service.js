"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ResumeGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Handlebars = __importStar(require("handlebars"));
const puppeteer = __importStar(require("puppeteer-core"));
let ResumeGeneratorService = ResumeGeneratorService_1 = class ResumeGeneratorService {
    logger = new common_1.Logger(ResumeGeneratorService_1.name);
    baseUploadsDir = path.join(process.cwd(), 'uploads');
    templateDir = path.join(this.baseUploadsDir, 'resume_templates');
    outputDir = path.join(this.baseUploadsDir, 'generated_resumes');
    constructor() {
        this.ensureDirectoriesExist();
        this.registerHandlebarsHelpers();
    }
    ensureDirectoriesExist() {
        [this.templateDir, this.outputDir].forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.logger.log(`Created directory: ${dir}`);
            }
        });
        const defaultTemplatePath = path.join(this.templateDir, 'default.html');
        if (!fs.existsSync(defaultTemplatePath)) {
            this.createDefaultTemplate(defaultTemplatePath);
        }
    }
    registerHandlebarsHelpers() {
        Handlebars.registerHelper('join', function (array, sep) {
            return array && array.length > 0 ? array.join(sep) : '';
        });
    }
    async generatePdfResume(user, job, tailoredData, templateName = 'default.html') {
        if (!tailoredData) {
            this.logger.warn(`No tailored data provided for ${user.email} - skipping PDF generation`);
            return null;
        }
        const templatePath = path.join(this.templateDir, templateName);
        if (!fs.existsSync(templatePath)) {
            this.logger.error(`Template not found at: ${templatePath}`);
            return null;
        }
        try {
            this.logger.log(`Generating PDF resume for ${user.email} -> ${job.title}...`);
            const templateHtml = fs.readFileSync(templatePath, 'utf8');
            const compiledTemplate = Handlebars.compile(templateHtml);
            const templateData = {
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: process.env.USER_PHONE || '(555) 123-4567',
                },
                job: {
                    title: job.title,
                    company: job.company,
                },
                resume: tailoredData,
            };
            const finalHtml = compiledTemplate(templateData);
            const browser = await puppeteer.launch({
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
            const outputFileName = `${user.id}_${job.id}_${Date.now()}.pdf`;
            const outputFilePath = path.join(this.outputDir, outputFileName);
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
            this.logger.log(`Successfully generated resume PDF at: ${outputFilePath}`);
            return outputFilePath;
        }
        catch (error) {
            this.logger.error('Failed to generate PDF resume', error instanceof Error ? error.stack : error);
            return null;
        }
    }
    createDefaultTemplate(filepath) {
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
};
exports.ResumeGeneratorService = ResumeGeneratorService;
exports.ResumeGeneratorService = ResumeGeneratorService = ResumeGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ResumeGeneratorService);
//# sourceMappingURL=resume-generator.service.js.map