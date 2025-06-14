`
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                  <table width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <thead style="background-color: #111827;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <img src="https://vr-verity.com/assets/images/logo.png" alt="VR VERITY Logo" style="max-height: 60px; margin-bottom: 10px;" />
                          <h1 style="color: #ffffff; margin: 0;">VR VERITY</h1>
                          <p style="color: #d1d5db; margin: 0;">Step Into Art</p>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding: 30px;">
                          <h2 style="margin-top: 0;">Thank you for your purchase, ${user.name || 'VR Explorer'}! 🎉</h2>
                          <p>We're excited to let you know that your VR scene purchase was successful. Here's what you bought:</p>
                          <ul style="padding-left: 20px; line-height: 1.6;">
                            ${validScenes.map(scene => `<li><strong>${scene.title}</strong></li>`).join('')}
                          </ul>
                          <p>You can now access your scenes directly from your dashboard.</p>

                          <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}/dashboard.html" style="background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
                          </div>

                          <p style="color: #6b7280;">If you have any issues or questions, feel free to contact us at <a href="mailto:info@vr-verity.com">info@vr-verity.com</a>.</p>
                          <p style="margin-top: 40px;">Stay creative,<br/>– The VR VERITY Team</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <footer style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} VR VERITY – All rights reserved.
                  </footer>
                </div>
              `