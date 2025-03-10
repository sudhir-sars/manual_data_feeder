// app/api/questions/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import { QuestionModel } from "@/Models/Question";
import { OptionModel } from "@/Models/Option";
import { SolutionModel } from "@/Models/Solution";


export async function POST(request: Request) {
  await dbConnect();

  try {
    const {
      subject,
      content,
      image,
      type,
      options,
      solution,
      tags,
      dificulty_level,
    } = await request.json();

    let createdOptionIds: any[] = [];
    // Process options only if type is "mcq"
    if (type === "mcq" && options && Array.isArray(options) && options.length > 0) {
      createdOptionIds = await Promise.all(
        options.map(
          async (opt: { option_id: string; content?: string; option_image?: string }) => {
            const newOption = new OptionModel({
              option_id: opt.option_id,
              content: opt.content,
              option_image: opt.option_image,
            });
            await newOption.save();
            return newOption._id;
          }
        )
      );
    }

    const newSolution = new SolutionModel({
      answer: solution.answer,
      explanation: solution.explanation,
      solution_image: solution.solution_image,
    });
    await newSolution.save();

    const newQuestion = new QuestionModel({
      subject,
      content,
      image,
      type: type || "mcq",
      options: createdOptionIds, // will be empty for numerical type
      solution: newSolution._id,
      tags: tags || [],
      dificulty_level: dificulty_level || 5,
    });
    await newQuestion.save();

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("Error saving question:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET(request: Request) {
    await dbConnect();
  
    try {
      const questions = await QuestionModel.find({})
        .populate("options")
        .populate("solution")
        .exec();
      return NextResponse.json({ success: true, questions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
