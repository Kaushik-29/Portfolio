/** Presentation-only icon maps shared by the original and Void themes. */
import type { IconType } from "react-icons";
import {
  FaPython,
  FaJava,
  FaJs,
  FaReact,
  FaNodeJs,
  FaDocker,
  FaAws,
  FaGitAlt,
} from "react-icons/fa";
import {
  SiCplusplus,
  SiTypescript,
  SiFastapi,
  SiFlask,
  SiTensorflow,
  SiOpencv,
  SiMongodb,
  SiMysql,
} from "react-icons/si";
import type { SkillName } from "./portfolio";

export const skillIcons: Record<SkillName, IconType> = {
  Python: FaPython,
  Java: FaJava,
  "C++": SiCplusplus,
  JavaScript: FaJs,
  TypeScript: SiTypescript,
  React: FaReact,
  "Node.js": FaNodeJs,
  FastAPI: SiFastapi,
  Flask: SiFlask,
  TensorFlow: SiTensorflow,
  OpenCV: SiOpencv,
  MongoDB: SiMongodb,
  MySQL: SiMysql,
  Git: FaGitAlt,
  Docker: FaDocker,
  AWS: FaAws,
};
