import { blink } from '../blink/client'
import { Booking, Event } from '../types'

export const sendBookingConfirmation = async (booking: Booking, event: Event) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a365d 0%, #3182ce 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎫 Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your tickets are ready</p>
        </div>
        
        <div style="padding: 30px; background: #f7fafc;">
          <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a365d; margin: 0 0 20px 0; font-size: 24px;">${event.title}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div>
                <strong style="color: #4a5568;">📅 Date:</strong><br>
                <span style="color: #2d3748;">${new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div>
                <strong style="color: #4a5568;">🕐 Time:</strong><br>
                <span style="color: #2d3748;">${event.time}</span>
              </div>
              <div>
                <strong style="color: #4a5568;">📍 Venue:</strong><br>
                <span style="color: #2d3748;">${event.venue}</span>
              </div>
              <div>
                <strong style="color: #4a5568;">🎫 Seats:</strong><br>
                <span style="color: #2d3748;">${booking.seat_count} seat${booking.seat_count > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div style="border-top: 2px solid #e2e8f0; padding-top: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #4a5568;">Booking ID:</strong><br>
                  <code style="background: #edf2f7; padding: 4px 8px; border-radius: 4px; color: #2d3748;">${booking.id}</code>
                </div>
                <div style="text-align: right;">
                  <strong style="color: #4a5568;">Total Amount:</strong><br>
                  <span style="font-size: 24px; color: #38a169; font-weight: bold;">$${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #1a365d; margin: 0 0 15px 0;">📱 Digital Ticket QR Code</h3>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
              bookingId: booking.id,
              eventId: booking.event_id,
              seats: booking.seat_count,
              customerEmail: booking.customer_email
            }))}" alt="Ticket QR Code" style="border: 2px solid #e2e8f0; border-radius: 8px;">
            <p style="color: #4a5568; margin: 15px 0 0 0; font-size: 14px;">
              Present this QR code at the venue entrance
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #edf2f7; border-radius: 8px; text-align: center;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Important Information</h4>
            <ul style="color: #4a5568; text-align: left; margin: 0; padding-left: 20px;">
              <li>Please arrive at least 30 minutes before the event starts</li>
              <li>Bring a valid ID that matches the booking name</li>
              <li>Screenshots of the QR code are acceptable</li>
              <li>Contact support if you need to make changes to your booking</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #2d3748; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Thank you for choosing TicketHub! 🎉<br>
            <a href="mailto:support@tickethub.com" style="color: #63b3ed;">support@tickethub.com</a>
          </p>
        </div>
      </div>
    `

    const emailText = `
BOOKING CONFIRMATION - TicketHub

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString()}
Time: ${event.time}
Venue: ${event.venue}
Seats: ${booking.seat_count}
Total: $${booking.total_amount.toFixed(2)}

Booking ID: ${booking.id}
Customer: ${booking.customer_name}

Please present your QR code at the venue entrance.

Thank you for choosing TicketHub!
    `

    const result = await blink.notifications.email({
      to: booking.customer_email,
      from: 'bookings@tickethub.com',
      subject: `🎫 Booking Confirmed - ${event.title}`,
      html: emailHtml,
      text: emailText
    })

    return result
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    throw error
  }
}

export const sendBookingReminder = async (booking: Booking, event: Event) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9f7aea 0%, #667eea 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Event Reminder</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your event is coming up soon!</p>
        </div>
        
        <div style="padding: 30px; background: #f7fafc;">
          <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1a365d; margin: 0 0 20px 0;">${event.title}</h2>
            <p style="color: #4a5568; font-size: 18px; margin-bottom: 20px;">
              📅 ${new Date(event.date).toLocaleDateString()} at ${event.time}
            </p>
            <p style="color: #4a5568; margin-bottom: 20px;">
              📍 ${event.venue}
            </p>
            
            <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #c53030; font-weight: bold;">
                ⚠️ Don't forget to bring your ticket QR code and a valid ID!
              </p>
            </div>
            
            <p style="color: #4a5568;">
              Booking ID: <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px;">${booking.id}</code>
            </p>
          </div>
        </div>
      </div>
    `

    const result = await blink.notifications.email({
      to: booking.customer_email,
      from: 'reminders@tickethub.com',
      subject: `⏰ Reminder: ${event.title} is tomorrow!`,
      html: emailHtml,
      text: `Event Reminder: ${event.title} is tomorrow at ${event.time} at ${event.venue}. Don't forget your ticket!`
    })

    return result
  } catch (error) {
    console.error('Error sending booking reminder email:', error)
    throw error
  }
}