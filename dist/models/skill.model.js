"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skill = exports.Proficiency = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_js_1 = require("./user.model.js");
var Proficiency;
(function (Proficiency) {
    Proficiency["BEGINNER"] = "beginner";
    Proficiency["INTERMEDIATE"] = "intermediate";
    Proficiency["ADVANCED"] = "advanced";
    Proficiency["EXPERT"] = "expert";
})(Proficiency || (exports.Proficiency = Proficiency = {}));
let Skill = class Skill extends sequelize_typescript_1.Model {
};
exports.Skill = Skill;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Skill.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_js_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Skill.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(Proficiency.INTERMEDIATE),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(Proficiency))),
    __metadata("design:type", String)
], Skill.prototype, "proficiency", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_js_1.User),
    __metadata("design:type", user_model_js_1.User)
], Skill.prototype, "user", void 0);
exports.Skill = Skill = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'skills', timestamps: true })
], Skill);
//# sourceMappingURL=skill.model.js.map