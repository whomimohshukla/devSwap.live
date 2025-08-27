// src/models/User.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";
import { SkillName, SkillLevel, SKILL_LEVELS } from "./skill.data";

export interface ISkillLevel {
	skillName: SkillName;
	level: SkillLevel;
}

export interface IUser {
	name: string;
	email: string;
	password?: string;
	avatar?: string;
	bio?: string;
	teachSkills: SkillName[];
	learnSkills: SkillName[];
	skillLevels?: ISkillLevel[];
	isOnline?: boolean;
	location?: string; // optional for geo/sharding
	lastSeen?: Date;
	pastSessions?: mongoose.Types.ObjectId[];
	createdAt?: Date;
	updatedAt?: Date;
	// OAuth provider linkage (internal)
	oauthProviders?: {
		google?: { id: string };
		github?: { id: string };
	};
}

export interface IUserDocument extends IUser, Document {
	comparePassword(candidate: string): Promise<boolean>;
	safeProfile(): Partial<IUser>;
}

export interface IUserModel extends Model<IUserDocument> {
    paginate: (query?: any, options?: any, callback?: any) => Promise<any>;
    findMatchFor(userId: string): Promise<IUserDocument | null>;
}

const SkillSchema = new Schema(
	{
		skillName: { type: String, required: true },
		level: {
			type: String,
			enum: SKILL_LEVELS,
			required: true,
		},
	},
	{ _id: false }
);

const UserSchema = new Schema<IUserDocument>(
	{
		name: { type: String, required: true, index: true },
		email: { type: String, required: true, unique: true, index: true },
		// Password is optional to allow OAuth-based users
		password: { type: String, select: false },
		avatar: String,
		bio: String,
		teachSkills: { type: [String], index: true }, // multikey index
		learnSkills: { type: [String], index: true }, // multikey index
		skillLevels: [SkillSchema],
		isOnline: { type: Boolean, default: false, index: true },
		location: String,
		lastSeen: Date,
		pastSessions: [{ type: Schema.Types.ObjectId, ref: "Session" }],
		oauthProviders: {
			google: {
				id: { type: String },
			},
			github: {
				id: { type: String },
			},
		},
	},
	{ timestamps: true }
);

// Plugins
UserSchema.plugin(mongoosePaginate);

// Text index for search
UserSchema.index({
    name: "text",
    bio: "text",
});

// Pre-save hook: hash password if modified
UserSchema.pre<IUserDocument>("save", async function (next) {
    // Only hash if password exists and was modified
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method: compare password
UserSchema.methods.comparePassword = function (candidate: string) {
    // If no password is set (OAuth user), comparison fails
    if (!this.password) return Promise.resolve(false);
    return bcrypt.compare(candidate, this.password);
};

// Instance method: safe profile
UserSchema.methods.safeProfile = function () {
	return {
		_id: this._id,
		name: this.name,
		email: this.email,
		avatar: this.avatar,
		bio: this.bio,
		teachSkills: this.teachSkills,
		learnSkills: this.learnSkills,
		skillLevels: this.skillLevels,
		isOnline: this.isOnline,
		lastSeen: this.lastSeen,
	};
};

// Static helper: naive DB fallback matching (not Redis)
UserSchema.statics.findMatchFor = async function (userId: string) {
	const me = await this.findById(userId).lean();
	if (!me) return null;

	// Match: someone who teaches something I want to learn AND learns something I teach
	return this.findOne({
		_id: { $ne: me._id },
		teachSkills: { $in: me.learnSkills },
		learnSkills: { $in: me.teachSkills },
		isOnline: true, // prefer online
	})
		.sort({ lastSeen: -1 })
		.select("-password")
		.lean();
};

export const User = mongoose.model<IUserDocument, IUserModel>(
	"User",
	UserSchema
);
export default User;
