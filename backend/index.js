import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


if (!process.env.API_KEY) {
    console.error('Error: API_KEY is not defined in the environment variables.');
    process.exit(1);
}


const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });


app.post('/generate', async (req, res) => {
    try {
        const { text, text1 } = req.body;

        
        if (!text || !text1) {
            return res.status(400).json({ message: 'Both text and text1 are required.' });
        }

        const prompt = `### **Shortened Prompt for AI Model**:

"I am providing you with two documents: 

1. **Ideal Document**: A reference showcasing the correct format and content structure.  
2. **Sample Document**: The document to be reviewed.  

Your task is to compare the **Sample Document** against the **Ideal Document** in these key areas:  

1. **Content**: Highlight missing or mismatched sections.  
2. **Format**: Check for layout, font, spacing, and alignment inconsistencies.  
3. **Tone and Language**: Evaluate professionalism and clarity of language.  
4. **Structure**: Review the logical flow and section order.  
5. **Suggestions**: Provide actionable feedback to improve alignment with the Ideal Document.  

Provide feedback in clear, numbered points with appropriate spacing. Keep the response concise, actionable, and constructive.  

**Ideal Document**:  
${text} 

**Sample Document**:  
${text1} `
        

        
        const result = await model.generateContent(prompt);

       
        if (result && result.response && result.response.text) {
            res.json({ message: 'Feedback generated successfully.', data: result.response.text() });
        } else {
            
            res.status(500).json({ message: 'Failed to generate feedback. Unexpected response format.' });
        }

    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).send('Error generating content');
    }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
