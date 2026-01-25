
import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";
import Stripe from 'stripe'

// Get User Credits


export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;


        if (!userId) {


            return res.status(401).json({ message: 'Unauthorized' });

        }


        const user = await prisma.user.findUnique({
            where: { id: userId }
        })


        res.json({ credits: user?.credits })


    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({ message: error.message })

    }
}



// Controller Function to Create New Project 


export const createUserProject = async (req: Request, res: Response) => {

    const userId = req.userId;
    try {

        const { initial_prompt } = req.body;

        if (!userId) {


            return res.status(401).json({ message: 'Unauthorized' });

        }


        const user = await prisma.user.findUnique({
            where: { id: userId }
        })



        if (user && user.credits < 5) {
            return res.status(403).json({ message: 'add credits to create  more projects ' })
        }

        // Create a new project 

        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,

                initial_prompt,
                userId
            }
        })




        // Updates User Total Creations 


        await prisma.user.update({
            where: { id: userId },
            data: { totalCreation: { increment: 1 } }
        })



        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        })


        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        })


        res.json({ projectId: project.id })




        // Enhance user Prompt 


        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'nvidia/nemotron-3-nano-30b-a3b:free',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI Website Builder Agent responsible for generating complete, high-quality websites based on user requirements. When creating a website, apply a modern, professional, and conversion-focused design with a clear layout, strong visual hierarchy, and ample white space. Use a consistent color scheme (neutral or light base with 1–2 accent colors for CTAs), modern sans-serif typography with clear heading/body contrast, and a clean, uncluttered interface that feels fast, intuitive, and trustworthy.

Automatically include all key sections and features required for a professional website, such as a hero section with a strong value proposition, navigation, core content or service sections, interactive elements (forms, dashboards, or tools if applicable), trust indicators (testimonials, logos, or stats), FAQ, and a complete footer with contact and legal information. Design the user experience to be smooth and guided, using clear calls-to-action, logical flow, hover states, micro-interactions, loading indicators, form validation, and meaningful empty or error states to improve usability and clarity.

Follow modern web design and development best practices by ensuring accessibility (proper contrast, semantic structure), SEO-friendly layout, fast performance, and scalable, component-based architecture. All websites must be fully responsive, optimized for mobile, tablet, and desktop with adaptive layouts and touch-friendly interactions. Include often-missed but critical elements such as security or privacy messaging (when relevant), performance optimization, subtle animations that enhance understanding, and a consistent design system to ensure long-term scalability and maintainability.
                    
                    
                    `
                },
                {
                    role: 'user',
                    content: initial_prompt
                }
            ]
        })



        // assistent 

        const enhancePrompt = promptEnhanceResponse.choices[0].message.content;
        await prisma.conversation.create({

            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancePrompt}"`,
                projectId: project.id
            }

        })




        await prisma.conversation.create({

            data: {
                role: 'assistant',
                content: 'now generating your website...',
                projectId: project.id
            }

        })





        // Generate website  code   

        const codeGenerationResponse = await openai.chat.completions.create({
            model: "nvidia/nemotron-3-nano-30b-a3b:free",
            messages: [
                {
                    role: 'system',
                    content: `
            
           You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancePrompt}"

    CRITICAL REQUIREMENTS:
    - You MUST output valid HTML ONLY. 
    - Use Tailwind CSS for ALL styling
    - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    - Use Tailwind utility classes extensively for styling, animations, and responsiveness
    - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
    - Use modern, beautiful design with great UX using Tailwind classes
    - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
    - Use Tailwind animations and transitions (animate-*, transition-*)
    - Include all necessary meta tags
    - Use Google Fonts CDN if needed for custom fonts
    - Use placeholder images from https://placehold.co/600x400
    - Use Tailwind gradient classes for beautiful backgrounds
    - Make sure all buttons, cards, and components use Tailwind styling

    CRITICAL HARD RULES:
    1. You MUST put ALL output ONLY into message.content.
    2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
    3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
    4. Do NOT include markdown, explanations, notes, or code fences.

    The HTML should be complete and ready to render as-is with Tailwind CSS.

            `

                },
                {
                    role: 'user',
                    content: enhancePrompt || ''
                }

            ]
        })


        const code = codeGenerationResponse.choices[0].message.content || '';



        if (!code) {
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code, please try again ",
                    projectId: project.id
                }
            })

            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            })

            return;


        }



        // Create Version  for the project

        const version = await prisma.version.create({

            data: {

                code: code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim(),
                description: 'Initial version',
                projectId: project.id
            }

        })


        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've created your website! You can now preview it and request any changes.",
                projectId: project.id
            }
        })

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim(),
                current_version_index: version.id
            }
        })

    } catch (error: any) {


        await prisma.user.update({


            where: { id: userId },
            data: { credits: { increment: 5 } }

        })


        console.log(error.code || error.message)
        res.status(500).json({ message: error.message })

    }
}



// Controller Function to Get A Single User Project 
// some eror 

export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;


        if (!userId) {


            return res.status(401).json({ message: 'Unauthorized' });

        }



        const { projectId } = req.params as { projectId: string; };

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {
                conversation: {
                    orderBy: { timestamp: 'asc' }
                },
                versions: { orderBy: { timestamp: 'asc' } }
            }
        })


        res.json({ project })


    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({ message: error.message })

    }
}



// Controller Function to Get All Users Projects

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;


        if (!userId) {


            return res.status(401).json({ message: 'Unauthorized' });

        }





        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        })


        res.json({ projects })


    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({ message: error.message })

    }
}





// Controller Function to Toogle Projects Publish



export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;


        if (!userId) {


            return res.status(401).json({ message: 'Unauthorized' });

        }




        const { projectId } = req.params as { projectId: string; };

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        })



        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }




        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished }
        })

        res.json({ message: project.isPublished ? 'Project Unpublished' : 'Project Published Successfully ' })


    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({ message: error.message })

    }
}





// Controller Function to Purchase Credits



export const purchaseCredits = async (req: Request, res: Response) => {


    try {



        interface Plan {
            credits: number;
            amount: number;

        }

        const plans = {
            basic: { credits: 100, amount: 5 },
            pro: { credits: 400, amount: 19 },
            enterprise: { credits: 1000, amount: 19 },
        }

        const userId = req.userId;
        const { planId } = req.body as { planId: keyof typeof plans }
        const origin = req.headers.origin as string;
        const plan: Plan = plans[planId]

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' })
        }



        const transaction = await prisma.transaction.create({
            data: {

                userId: userId!,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits
            }


        })


        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

        
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AiSiteBuilder - ${plan.credits} credits`
                        },
                        unit_amount: Math.floor(transaction.amount) * 100
                    },
                    quantity: 1
                },
            ],
            mode: 'payment',
            metadata: {
                transitionId: transaction.id,
                appId: 'ai-site-builder'
            },


            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,  // Expire in 30 minutes


        });


       res.json({ payment_link: session.url })  // ✅ Fixed spelling


    } catch (error: any) {
        console.log(error.code || error.message)
        res.status(500).json({ message: error.message });

    }


}

