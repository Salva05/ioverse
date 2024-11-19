/*
According to official documentation of OpenAI
Every non gpt-4* model has a default Max Result 
parameter for File Search tool of 5, else 20.
*/ 
export const computeModelMaxResultsDefault = (model) => {
    if (model.startsWith("gpt-4")) {
        return 20;
    }
    return 5;
};