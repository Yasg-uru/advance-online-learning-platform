import mongoose, { Schema, Document } from "mongoose";
export interface Lesson extends Document {
  title: string;
  description: string;
  contentUrl: string;
  contentType: "Vedio" | "Article" | "Quiz" | "Assignment";
  duration: number;
  resources: {
    resourceType: "PDF" | "Link" | "Image";
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
export interface Module extends Document {
  module: { title: any; instructions: any; questions: any };
  title: string;
  description: string;
  lessons: Lesson[];
  orderIndex: number;
  quiz: Quiz;
  createdAt: Date;
  updatedAt: Date;
}
export interface QuizQuestions extends Document {
  questionText: string;
  questionType: "Multiple Choice" | "True/False" | "Short Answer";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;

  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
  createdAt: Date;
  updatedAT: Date;
}
export interface Quiz extends Document {
  title: string;
  instructions: string;
  questions: QuizQuestions[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course extends Document {
  title: string;
  description: string;
  thumbnailUrl: string;
  isPaid: boolean;
  category: string;
  level: "Beginner" | "Intermediate" | "Advance";
  language: string;
  prerequisites: string[];
  targetAudience: string[];
  learningOutComes: string[];
  syllabus: string;
  tags: string[];
  modules: Module[];
  quizzes: Quiz[];
  price: number;
  discount: number;
  duration: number;
  rating: number;
  reviews: {
    userId: Schema.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  enrolledUsers: {
    userId: Schema.Types.ObjectId;
    paymentStatus: "Paid" | "Pending" | "Failed";
    enrolledAt: Date;
  }[];

  instructorId: Schema.Types.ObjectId[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const lessonSchema: Schema = new Schema<Lesson>(
  {
    title: {
      type: String,
      required: [true, "Pleae enter title of lesson"],
    },
    description: {
      type: String,
      required: [true, "Please enter description"],
    },
    contentUrl: {
      type: String,
      required: [true, "Please enter content url"],
    },
    duration: {
      type: Number,
      required: [true, "Please Enter duration"],
    },
    resources: [
      {
        resourceType: {
          type: String,
          enum: ["PDF", "Link", "Image"],
          required: [true, "Please enter resource type"],
        },
        url: {
          type: String,
          required: [true, "Please enter url"],
        },
      },
    ],
  },
  { timestamps: true }
);

export const QuizQuestionsSchema: Schema = new Schema<QuizQuestions>(
  {
    questionText: {
      type: String,
      required: [true, "please enter questionText"],
    },
    questionType: {
      type: String,
      enum: ["Multiple Choice", "True/False", "Short Answer"],
      required: [true, "please enter question type "],
    },
    difficulty: {
      type: String,
      required: [true, "Please enter difficuly"],
      enum: ["Easy", "Medium", "Hard"],
    },

    points: {
      type: Number,
      required: [true, "enter points on this question "],
    },

    options: [
      {
        optionText: {
          type: String,
          required: [true, "please enter the options text"],
        },
        isCorrect: {
          type: Boolean,
          required: [true, "Please enter the iscorrect"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
export const QuizSchema: Schema = new Schema<Quiz>(
  {
    title: {
      type: String,
      required: [true, "Please Enter title of quize"],
    },
    instructions: {
      type: String,
      required: [true, "Please enter the instucrions"],
    },
    questions: [QuizQuestionsSchema],
  },
  { timestamps: true }
);
export const ModuleSchema: Schema = new Schema<Module>({
  title: {
    type: String,
    required: [true, "Please Enter title"],
  },
  description: {
    type: String,
    required: [true, "Please enter description "],
  },
  lessons: [lessonSchema],
  orderIndex: {
    type: Number,
    required: [true, "Please Enter order index"],
  },
  quiz: {
    type: QuizSchema,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

export const CourseSchema: Schema = new Schema<Course>(
  {
    title: {
      type: String,
      required: [true, "Please Enter the title of the course "],
    },
    description: {
      type: String,
      required: [true, "Please Enter the description of the course"],
    },
    thumbnailUrl: {
      type: String,
      // required: [true, "please enter the thumbnail url"],
    },
    category: {
      type: String,
      required: [true, "please enter the category of the course "],
    },
    level: {
      type: String,
      required: [true, "Please enter the level of the course "],
      enum: ["Beginner", "Intermediate", "Advance"],
    },
    language: {
      type: String,
      required: [true, "please enter the language type "],
    },
    prerequisites: [
      {
        type: String,
      },
    ],
    targetAudience: [
      {
        type: String,
        required: [true, "Please Enter targetAudience"],
      },
    ],
    learningOutComes: [
      {
        type: String,
        required: [true, "Please Enter Learning Outcomes"],
      },
    ],
    syllabus: {
      type: String,
      required: [true, "Please  enter the syllabus"],
    },

    tags: [
      {
        type: String,
        required: [true, "please enter the tags "],
      },
    ],

    modules: [ModuleSchema],
    quizzes: [QuizSchema],
    price: {
      type: Number,
      required: [true, "Please Enter the price "],
    },

    discount: {
      type: Number,
      default: 0,
    },

    duration: {
      type: Number,
      required: [true, "Please Enter the duration of the course "],
    },
    isPaid: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 0,
          max: 5,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    instructorId: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Instructor ID is required"],
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
    enrolledUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        paymentStatus: {
          type: String,
          default: "Pending",
          enum: ["Paid", "Pending", "Failed"],
        },
        enrolledAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);
const courseModel = mongoose.model<Course>("Course", CourseSchema);
export default courseModel;
