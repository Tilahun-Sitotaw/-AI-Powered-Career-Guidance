const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * POST /api/contact/send
 * Send contact form message via email
 */
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'support@careerpath.ai',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
          </div>
          
          <div style="background: #f5f7fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin-top: 20px;">
              <h3 style="margin-top: 0; color: #667eea;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Submitted on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message - CareerPath AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">Thank You for Contacting Us!</h2>
          </div>
          
          <div style="background: #f5f7fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${name},</p>
            
            <p>Thank you for reaching out to CareerPath AI. We have received your message and will get back to you as soon as possible.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">Your Message Details:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>In the meantime, feel free to explore our platform and check out our resources:</p>
            <ul style="color: #667eea;">
              <li>Learning Paths - Personalized career roadmaps</li>
              <li>Skill Gap Analysis - Identify areas for improvement</li>
              <li>Internship Opportunities - Find relevant positions</li>
              <li>Interview Preparation - Practice with AI-generated questions</li>
            </ul>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>CareerPath AI Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              © 2026 CareerPath AI. All rights reserved.<br>
              <a href="http://localhost:5173" style="color: #667eea; text-decoration: none;">Visit our platform</a>
            </p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    console.log(`✓ Contact form submitted by ${name} (${email})`);
    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
