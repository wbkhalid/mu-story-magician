export const speakText = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1; // Adjust the rate of speech
  utterance.pitch = 1; // Adjust the pitch of speech
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};
