"use client";

import { useState } from "react";
import Latex from "react-latex-next";
import { Button } from "@/components/ui/button";
import "katex/dist/katex.min.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState = {
  subject: "Physics", // default subject
  content: "",
  image: "",
  type: "mcq", // default type is "mcq"
  options: [
    { option_id: "A", content: "", option_image: "" },
    { option_id: "B", content: "", option_image: "" },
    { option_id: "C", content: "", option_image: "" },
    { option_id: "D", content: "", option_image: "" },
  ],
  solution: {
    answer: "",
    explanation: "",
    solution_image: "",
  },
  tags: [],
  dificulty_level: 5,
};

// Helper to extract URL if the input is in Markdown image format.
const extractImageUrl = (input: string) => {
  const regex = /!\[\]\((.*?)\)/;
  const match = input.match(regex);
  return match && match[1] ? match[1] : input;
};

// Helper to strip leading pattern like "(3)" from a string.
const stripOptionPrefix = (text: string) => {
  return text.replace(/^\(\d+\)\s*/, '');
};

// Helper to strip a leading question number, e.g. "1. " or "23. "
const stripQuestionNumber = (text: string) => {
  return text.replace(/^\d+\.\s*/, '');
};

// Helper to strip "Sol. " from the beginning of the solution explanation.
const stripSolutionPrefix = (text: string) => {
  return text.replace(/^Sol\.\s*/, '');
};

export default function NewQuestionPage() {
  const [questionData, setQuestionData] = useState(initialState);
  // State for pasted options block.
  const [optionsBlock, setOptionsBlock] = useState("");

  // Parse the pasted options block into individual option objects.
  const parseOptionsBlock = () => {
    const lines = optionsBlock.split("\n").filter((line) => line.trim() !== "");
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const parsedOptions = lines.map((line, index) => {
      // Match pattern like: (1) <option content>
      const regex = /^\(\d+\)\s*(.*)$/;
      let match = line.match(regex);
      let content = match ? match[1].trim() : line.trim();
      // Check for a Markdown image in the content.
      const imgRegex = /!\[\]\((.*?)\)/;
      let option_image = "";
      const imgMatch = content.match(imgRegex);
      if (imgMatch && imgMatch[1]) {
        option_image = imgMatch[1];
        content = content.replace(imgRegex, "").trim();
      }
      return { option_id: letters[index] || `${index + 1}`, content, option_image };
    });
    setQuestionData((prev) => ({ ...prev, options: parsedOptions }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: string,
    index?: number
  ) => {
    let { name, value } = e.target;
    // For image fields, extract URL if in Markdown format.
    if (name.includes("image")) {
      value = extractImageUrl(value);
    }
    if (section === "question") {
      if (name === "content") {
        value=value.trim()
        value = stripQuestionNumber(value);
      } else {
        value = value.trim();
      }
      setQuestionData((prev) => ({ ...prev, [name]: value }));
    }  else if (section === "solution") {
      if (name === "explanation") {
        // Ensure value is defined
        const inputValue = value || "";
        value=value.trim()
        let newValue = stripSolutionPrefix(inputValue)
        // Check for a Markdown image in the explanation.
        const imgRegex = /!\[\]\((.*?)\)/;
        const imgMatch = newValue.match(imgRegex);
        if (imgMatch && imgMatch[1]) {
          const extractedUrl = imgMatch[1];
          newValue = newValue.replace(imgRegex, "").trim();
          setQuestionData((prev) => ({
            ...prev,
            solution: {
              ...prev.solution,
              solution_image: extractedUrl,
              explanation: newValue,
            },
          }));
          return;
        }
        setQuestionData((prev) => ({
          ...prev,
          solution: { ...prev.solution, [name]: newValue },
        }));
      } else {
        setQuestionData((prev) => ({
          ...prev,
          solution: { ...prev.solution, [name]: (value || "").trim() },
        }));
      }
    }
     else if (section === "option" && index !== undefined) {
      const newOptions = [...questionData.options];
      if (name === "content") {
        value=value.trim()
        let newValue = stripOptionPrefix(value)
        // Check for a Markdown image in the option content.
        const imgRegex = /!\[\]\((.*?)\)/;
        const imgMatch = newValue.match(imgRegex);
        if (imgMatch && imgMatch[1]) {
          newOptions[index].option_image = imgMatch[1];
          newValue = newValue.replace(imgRegex, "").trim();
        }
        value = newValue;
      } else {
        value = value.trim();
      }
      newOptions[index] = { ...newOptions[index], [name]: value };
      setQuestionData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string,
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        if (section === "question") {
          setQuestionData((prev) => ({ ...prev, image: base64Image }));
        } else if (section === "option" && index !== undefined) {
          const newOptions = [...questionData.options];
          newOptions[index] = { ...newOptions[index], option_image: base64Image };
          setQuestionData((prev) => ({ ...prev, options: newOptions }));
        } else if (section === "solution") {
          setQuestionData((prev) => ({
            ...prev,
            solution: { ...prev.solution, solution_image: base64Image },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to double the dollar signs for LaTeX.
  const doubleDollarSigns = (latexContent: string) => {
    return latexContent.replace(/\$/g, "$$$$");
  };

  const saveData = async () => {
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });
      if (response.ok) {
        alert("Data saved successfully!");
        // Reset the form but preserve the subject from the last question.
        setQuestionData({ ...initialState, subject: questionData.subject });
        setOptionsBlock("");
      } else {
        alert("Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("An error occurred while saving data.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Data Input */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="hidden">Enter Question Data</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Subject & Type Selectors */}
            <div className="flex space-x-11">
              <div className="flex items-center space-x-2 mb-4">
                <Label className="mr-2">Subject:</Label>
                <Button
                  variant={questionData.subject === "Physics" ? "default" : "outline"}
                  onClick={() =>
                    setQuestionData((prev) => ({ ...prev, subject: "Physics" }))
                  }
                >
                  Physics
                </Button>
                <Button
                  variant={questionData.subject === "Maths" ? "default" : "outline"}
                  onClick={() =>
                    setQuestionData((prev) => ({ ...prev, subject: "Maths" }))
                  }
                >
                  Maths
                </Button>
                <Button
                  variant={questionData.subject === "Chemistry" ? "default" : "outline"}
                  onClick={() =>
                    setQuestionData((prev) => ({ ...prev, subject: "Chemistry" }))
                  }
                >
                  Chemistry
                </Button>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Label className="mr-2">Question Type:</Label>
                <Button
                  variant={questionData.type === "mcq" ? "default" : "outline"}
                  onClick={() =>
                    setQuestionData((prev) => ({
                      ...prev,
                      type: "mcq",
                      options: prev.options.length > 0 ? prev.options : [
                        { option_id: "A", content: "", option_image: "" },
                        { option_id: "B", content: "", option_image: "" },
                        { option_id: "C", content: "", option_image: "" },
                        { option_id: "D", content: "", option_image: "" },
                      ],
                    }))
                  }
                >
                  MCQ
                </Button>
                <Button
                  variant={questionData.type === "numerical" ? "default" : "outline"}
                  onClick={() =>
                    setQuestionData((prev) => ({ ...prev, type: "numerical", options: [] }))
                  }
                >
                  Numerical
                </Button>
              </div>
            </div>

            {/* Question Section */}
            <div className="space-y-4">
              <div>
                <Label>Question Content (LaTeX supported)</Label>
                <Textarea
                  rows={5}
                  name="content"
                  value={questionData.content}
                  onChange={(e) => handleInputChange(e, "question")}
                />
              </div>
              <div className="flex items-center">
                <div className="w-3/4">
                  <Label>Question Image URL or Upload Image</Label>
                  <Input
                    name="image"
                    value={questionData.image}
                    onChange={(e) => handleInputChange(e, "question")}
                  />
                </div>
                <Button className="ml-4" onClick={() => document.getElementById("questionImageInput")?.click()}>
                  Upload
                </Button>
                <input
                  id="questionImageInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "question")}
                />
              </div>
            </div>

            {/* Options Section (only for MCQ) */}
            {questionData.type === "mcq" && (
              <>
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Options</h3>
                  {/* Group options in pairs */}
                  {[0, 2].map((i) => (
                    <div key={i} className="space-y-2 border p-4 rounded">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>
                            Option {questionData.options[i].option_id} Content (LaTeX supported)
                          </Label>
                          <Input
                            name="content"
                            value={questionData.options[i].content}
                            onChange={(e) => handleInputChange(e, "option", i)}
                          />
                        </div>
                        <div>
                          <Label>
                            Option {questionData.options[i + 1].option_id} Content (LaTeX supported)
                          </Label>
                          <Input
                            name="content"
                            value={questionData.options[i + 1].content}
                            onChange={(e) => handleInputChange(e, "option", i + 1)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>
                            Option {questionData.options[i].option_id} Image URL or Upload Image
                          </Label>
                          <div className="flex items-center">
                            <Input
                              name="option_image"
                              value={questionData.options[i].option_image}
                              onChange={(e) => handleInputChange(e, "option", i)}
                            />
                            <Button className="ml-2" onClick={() => document.getElementById(`optionImageInput${i}`)?.click()}>
                              Upload
                            </Button>
                          </div>
                          <input
                            id={`optionImageInput${i}`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "option", i)}
                          />
                        </div>
                        <div>
                          <Label>
                            Option {questionData.options[i + 1].option_id} Image URL or Upload Image
                          </Label>
                          <div className="flex items-center">
                            <Input
                              name="option_image"
                              value={questionData.options[i + 1].option_image}
                              onChange={(e) => handleInputChange(e, "option", i + 1)}
                            />
                            <Button className="ml-2" onClick={() => document.getElementById(`optionImageInput${i + 1}`)?.click()}>
                              Upload
                            </Button>
                          </div>
                          <input
                            id={`optionImageInput${i + 1}`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "option", i + 1)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Options Block Input */}
                <div className="mt-6 space-y-2">
                  <Label>Paste Options Block</Label>
                  <div className="flex space-x-3 ">

                  <Textarea
                    rows={6}
                    placeholder={`(1) $\\frac{125 \\pi}{6}$\n(2) $\\frac{125 \\pi}{24}$\n(3) $\\frac{125 \\pi}{4}$\n(4) $\\frac{125 \\pi}{12}$`}
                    value={optionsBlock}
                    onChange={(e) => setOptionsBlock(e.target.value)}
                    />
                  <Button onClick={parseOptionsBlock}>Parse Options</Button>
                    </div>
                </div>
              </>
            )}

            {/* Solution Section */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Solution</h3>
              <div>
                <Label>Answer</Label>
                <Input
                  name="answer"
                  value={questionData.solution.answer}
                  onChange={(e) => handleInputChange(e, "solution")}
                />
              </div>
              <div>
                <Label>Explanation</Label>
                <Textarea
                  rows={10}
                  name="explanation"
                  value={questionData.solution.explanation}
                  onChange={(e) => handleInputChange(e, "solution")}
                />
              </div>
              <div className="flex items-center">
                <div className="w-3/4">
                  <Label>Solution Image URL or Upload Image</Label>
                  <Input
                    name="solution_image"
                    value={questionData.solution.solution_image}
                    onChange={(e) => handleInputChange(e, "solution")}
                  />
                </div>
                <Button className="ml-4" onClick={() => document.getElementById("solutionImageInput")?.click()}>
                  Upload
                </Button>
                <input
                  id="solutionImageInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "solution")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Preview and Next */}
      <div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="hidden">Preview</CardTitle>
            <Button onClick={saveData}>Next</Button>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">Subject: {questionData.subject}</h3>
            <h3 className="text-lg font-semibold">Question</h3>
            <p>
              <strong>Content:</strong>{" "}
              <Latex>{questionData.content}</Latex>
            </p>
            {questionData.image && (
              <img
                src={questionData.image}
                alt="Question Image"
                className="mt-2 max-h-[200px] w-full object-contain"
              />
            )}
            {questionData.type === "mcq" && (
              <>
                <h3 className="text-lg font-semibold mt-4">Options</h3>
                {questionData.options.map((option, index) => (
                  <div key={index} className="mt-2">
                    <p>
                      <strong>Option {option.option_id} Content:</strong>{" "}
                      <Latex>{doubleDollarSigns(option.content)}</Latex>
                    </p>
                    {option.option_image && (
                      <img
                        src={option.option_image}
                        alt={`Option ${option.option_id} Image`}
                        className="mt-2 max-h-[200px] w-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </>
            )}
            {questionData.type === "numerical" && (
              <p className="mt-4 italic text-gray-600">
                Numerical question: Options will not be displayed.
              </p>
            )}
            <h3 className="text-lg font-semibold mt-4">Solution</h3>
            <p>
              <strong>Answer:</strong> {questionData.solution.answer}
            </p>
            <p>
              <strong>Explanation:</strong>{" "}
              <Latex>{doubleDollarSigns(questionData.solution.explanation)}</Latex>
            </p>
           
            {questionData.solution.solution_image && (
              <img
                src={questionData.solution.solution_image}
                alt="Solution Image"
                className="mt-2 max-h-[200px] w-full object-contain"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
