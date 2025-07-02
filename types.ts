
export interface SceneData {
  timeOfDay: string;
  lighting: string;
  mainLocation: string;
  locationDetails: string;
  atmosphereMood: string;
  soundDetails: string;
  characterGender: string;
  characterAge: string;
  characterBodyShape: string;
  characterFeatures: string;
  characterClothing: string;
  characterProps: string;
  characterAction: string;
  characterEmotion: string;
  dialogueTone: string;
  dialogueScript: string;
  dialogueAccent: string;
  cameraAngle: string;
  cameraMovement: string;
  imageMood: string;
  imageStyle: string;
}

export interface PromptEntry {
  id: string;
  name: string;
  prompt: string;
  data: SceneData;
}
