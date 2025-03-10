"use client";

import { useEffect, useState } from "react";
import Latex from "react-latex-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Option {
  _id: string;
  option_id: string;
  content?: string;
  option_image?: string;
}

interface Solution {
  _id: string;
  answer: string;
  explanation?: string;
  solution_image?: string;
}

interface Question {
  _id: string;
  subject: string;
  content: string;
  image?: string;
  type: string;
  options?: Option[];
  solution?: Solution;
  tags: string[];
  dificulty_level: number;
}

export default function AllQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  // Helper to double the dollar signs for LaTeX
  const doubleDollarSigns = (latexContent: string) => {
    return latexContent.replace(/\$/g, "$$$$");
  };

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.success) {
          console.log(data.questions);
          setQuestions(data.questions);
        } else {
          console.error("Error fetching questions:", data.error);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }
    fetchQuestions();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Questions</h1>
      {questions.map((question) => (
        <Card key={question._id} className="mb-4">
          <CardHeader>
            <CardTitle>
              {question.type.toUpperCase()} Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Subject:</Label> {question.subject}
            </div>
            <div>
              <Label>Content:</Label>
              <div>
                <Latex>{doubleDollarSigns(question.content)}</Latex>
              </div>
            </div>
            {question.image && (
              <div className="mt-2">
                <img
                  src={question.image}
                  alt="Question Image"
                  className="max-h-[200px] w-full object-contain"
                />
              </div>
            )}

            {question.type === "mcq" && question.options && question.options.length > 0 && (
              <div className="mt-2">
                <Label>Options:</Label>
                <ul>
                  {question.options.map((option) => (
                    <li key={option._id} className="mb-2">
                      <strong>{option.option_id}:</strong>{" "}
                      <Latex>{doubleDollarSigns(option.content || "")}</Latex>
                      {option.option_image && (
                        <div className="mt-1">
                          <img
                            src={option.option_image}
                            alt={`Option ${option.option_id} Image`}
                            className="max-h-[100px] w-full object-contain"
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {question.type === "numerical" && (
              <div className="mt-2 italic text-gray-600">
                Numerical question: No options.
              </div>
            )}

            {question.solution && (
              <div className="mt-2">
                <Label>Solution:</Label>
                <p>
                  <strong>Answer:</strong> {question.solution.answer}
                </p>
                {question.solution.explanation && (
                  <p>
                    <strong>Explanation:</strong>{" "}
                    <Latex>{doubleDollarSigns(question.solution.explanation)}</Latex>
                  </p>
                )}
                {question.solution.solution_image && (
                  <div className="mt-2">
                    <img
                      src={question.solution.solution_image}
                      alt="Solution Image"
                      className="max-h-[100px] w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-2">
              <Label>Difficulty:</Label> {question.dificulty_level}
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="mt-2">
                <Label>Tags:</Label> {question.tags.join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
