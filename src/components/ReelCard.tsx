import React, { useState } from "react";

import { Check } from "lucide-react";

const skillData = [
  [{ title: "Lorem Ipsum", color: "blue" }],
  [
    { title: "Dolor Sit", color: "green" },
    { title: "Amet", color: "green" },
  ],
  [
    { title: "Consectetur", color: "purple" },
    { title: "Adipiscing", color: "purple" },
  ],
  [
    { title: "Elit Sed", color: "orange" },
    { title: "Do Eiusmod", color: "orange" },
    { title: "Tempor", color: "orange" },
  ],
  [
    { title: "Incididunt Ut", color: "blue" },
    { title: "Labore Et", color: "blue" },
  ],
  [{ title: "Magna Aliqua", color: "green" }],
];

const styles = `
.skill-tree-container {
  background-color: #f7f7f7;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  width: 100%;
}

.skill-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.skill-row {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.skill-node {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 15px;
  padding: 10px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.skill-node:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.skill-node:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Color Variations */
.skill-node.blue { background-color: #58a7d6; border-bottom: 6px solid #4a8dbb; }
.skill-node.green { background-color: #78c843; border-bottom: 6px solid #61a337; }
.skill-node.purple { background-color: #ce82ff; border-bottom: 6px solid #a869d1; }
.skill-node.orange { background-color: #f79437; border-bottom: 6px solid #d37a28; }

/* Selected state */
.skill-node.selected {
  background-color: gold !important;
  border-bottom: 6px solid #b8860b !important;
  color: white;
}
`;

const SkillTree = () => {
  // 押されたスキルの状態を rowIndex と skillIndex で管理
  const [selectedNodes, setSelectedNodes] = useState<boolean[][]>(
    skillData.map((row) => row.map(() => false))
  );

  const toggleNode = (rowIndex: number, skillIndex: number) => {
    setSelectedNodes((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[rowIndex][skillIndex] = !copy[rowIndex][skillIndex];
      return copy;
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="skill-tree-container">
        <div className="skill-tree">
          {skillData.map((row, rowIndex) => (
            <div className="skill-row" key={rowIndex}>
              {row.map((skill, skillIndex) => {
                const isSelected = selectedNodes[rowIndex][skillIndex];
                return (
                  <div
                    key={skillIndex}
                    className={`skill-node ${skill.color} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => toggleNode(rowIndex, skillIndex)}
                  >
                    {isSelected ? (
                      <Check size={32} color="white" />
                    ) : (
                      skill.title
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SkillTree;
