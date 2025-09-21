import React, { useState } from "react";
import { Check, Play } from "lucide-react";

interface Reel {
  transcript: string;
  topics: string;
  videoBlob: Blob;
}

interface SkillTreeProps {
  reels: Reel[];
  getReelVideoUrl: (index: number) => string | null;
  onReelPlay: (index: number, videoUrl: string) => void;
  onOriginalVideoPlay: () => void;
  selectedIndex: number | null;
  isOriginalVideoSelected: boolean;
  originalVideoTitle?: string;
}

const styles = `
.skill-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  padding: 20px 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.skill-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.skill-node {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
  flex-shrink: 0;
  margin: 8px;
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
.skill-node.red { background-color: #ff6b6b; border-bottom: 6px solid #e55555; }
.skill-node.teal { background-color: #13c4a3; border-bottom: 6px solid #0fa085; }

/* Selected state */
.skill-node.selected {
  background-color: gold !important;
  border-bottom: 6px solid #b8860b !important;
  color: white;
}

/* Completed state */
.skill-node.completed {
  background-color: #4ade80 !important;
  border-bottom: 6px solid #22c55e !important;
  color: white;
}

/* Original video state */
.skill-node.original {
  background-color: #6366f1 !important;
  border-bottom: 6px solid #4f46e5 !important;
  color: white;
  font-size: 13px;
  width: 140px !important;
  height: 140px !important;
  padding: 16px !important;
}

.skill-node .play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.skill-node.original .play-icon {
  opacity: 0.8;
}

.skill-node:hover .play-icon {
  opacity: 1;
}

.skill-node:hover .skill-text {
  opacity: 0.3;
}

.skill-text {
  transition: opacity 0.2s ease-in-out;
  word-break: break-word;
  hyphens: auto;
}
`;

const SkillTree: React.FC<SkillTreeProps> = ({
  reels,
  getReelVideoUrl,
  onReelPlay,
  onOriginalVideoPlay,
  selectedIndex,
  isOriginalVideoSelected,
  originalVideoTitle = "Original Video",
}) => {
  const [completedNodes, setCompletedNodes] = useState<Set<number>>(new Set());

  const colors = ["blue", "green", "purple", "orange", "red", "teal"];

  // Organize nodes into rows (original video first, then reels)
  const organizeNodesIntoRows = () => {
    const rows: Array<Array<{type: 'original' | 'reel', index?: number}>> = [];
    
    // First row: original video
    rows.push([{type: 'original'}]);
    
    // Organize reels into subsequent rows with responsive sizing
    let currentRow: Array<{type: 'original' | 'reel', index?: number}> = [];
    
    reels.forEach((_, index) => {
      currentRow.push({type: 'reel', index});
      
      // Create rows with more flexible sizing to prevent cutoff
      // Use smaller row sizes to ensure they fit better
      const rowSizes = [3, 2, 3, 2, 3, 2, 3, 2];
      const currentRowSize = rowSizes[(rows.length - 1) % rowSizes.length];
      
      if (currentRow.length >= currentRowSize) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });
    
    // Add any remaining reels
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
    
    return rows;
  };

  const nodeRows = organizeNodesIntoRows();

  const handleReelClick = (reelIndex: number) => {
    const videoUrl = getReelVideoUrl(reelIndex);
    if (videoUrl) {
      onReelPlay(reelIndex, videoUrl);
      
      // Mark as completed when clicked
      setCompletedNodes(prev => new Set(prev).add(reelIndex));
    }
  };

  const handleOriginalVideoClick = () => {
    onOriginalVideoPlay();
  };

  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="skill-tree">
          {nodeRows.map((row, rowIndex) => (
            <div className="skill-row" key={rowIndex}>
              {row.map((node, nodeIndex) => {
                if (node.type === 'original') {
                  return (
                    <div
                      key="original"
                      className={`skill-node original ${
                        isOriginalVideoSelected ? "selected" : ""
                      }`}
                      onClick={handleOriginalVideoClick}
                      title="Play original video"
                    >
                      <div className="skill-text">
                        {truncateText(originalVideoTitle)}
                      </div>
                      <div className="play-icon">
                        <Play size={28} color="white" fill="white" />
                      </div>
                    </div>
                  );
                } else {
                  const reelIndex = node.index!;
                  const reel = reels[reelIndex];
                  const isSelected = selectedIndex === reelIndex;
                  const isCompleted = completedNodes.has(reelIndex);
                  const colorClass = colors[reelIndex % colors.length];
                  
                  return (
                    <div
                      key={`reel-${reelIndex}`}
                      className={`skill-node ${colorClass} ${
                        isSelected ? "selected" : ""
                      } ${isCompleted ? "completed" : ""}`}
                      onClick={() => handleReelClick(reelIndex)}
                      title={`${reel.transcript} - ${reel.topics}`}
                    >
                      <div className="skill-text">
                        {isCompleted ? (
                          <Check size={36} color="white" />
                        ) : (
                          truncateText(reel.transcript)
                        )}
                      </div>
                      <div className="play-icon">
                        <Play size={28} color="white" fill="white" />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ))}
      </div>
    </>
  );
};

export default SkillTree;
