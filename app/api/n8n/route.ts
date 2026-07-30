import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://marcomuller.app.n8n.cloud/webhook/web/booking/create'

    const payload = await request.json()

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('N8N webhook error:', response.status, response.statusText)
      // Return success anyway - don't block the booking operation
      return NextResponse.json({ success: true, message: 'Webhook failed but booking saved' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in n8n API route:', error)
    // Return success anyway - don't block the booking operation
    return NextResponse.json({ success: true, message: 'Webhook error but booking saved' })
  }
}
