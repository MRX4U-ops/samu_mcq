import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ActivityIndicator, Share, Alert, Platform 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Share2, Download, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';

const CertificateViewScreen = ({ route, navigation }) => {
  const { cert } = route.params;
  const { colors, isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!cert) return null;

  const verificationUrl = `https://mrx4u-ops.github.io/samu_mcq/#/verify/${cert.certificate_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  // The beautiful landscape academic certificate HTML template
  const getCertificateHtml = () => {
    const goldColor = '#D4AF37';
    const navyColor = '#0F1C3F';
    const levelText = cert.achievement_level === 'Platinum Scholar' ? '🥇 Platinum Scholar' : 
                      cert.achievement_level === 'Gold Excellence' ? '⭐ Gold Excellence' : '🏅 Academic Distinction';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Certificate of Excellence</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Pinyon+Script&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
            overflow: hidden;
          }
          .cert-paper {
            width: 100%;
            height: 100%;
            background-color: #fcfcf9;
            padding: 12px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .outer-border {
            width: 100%;
            height: 100%;
            border: 3px double ${goldColor};
            padding: 4px;
            box-sizing: border-box;
          }
          .inner-border {
            width: 100%;
            height: 100%;
            border: 1.5px solid ${navyColor};
            padding: 16px 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            position: relative;
            text-align: center;
          }
          .watermark-cross {
            position: absolute;
            top: 10%;
            right: 10%;
            font-size: 80px;
            color: ${navyColor};
            opacity: 0.015;
            pointer-events: none;
          }
          .watermark-cross-left {
            position: absolute;
            bottom: 10%;
            left: 10%;
            font-size: 80px;
            color: ${navyColor};
            opacity: 0.015;
            pointer-events: none;
          }
          .cert-header {
            margin-bottom: 4px;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            font-weight: 900;
            color: ${navyColor};
            letter-spacing: 3px;
          }
          .logo-sub {
            font-size: 7px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 1px;
            margin-top: 1px;
          }
          .banner {
            font-family: 'Playfair Display', serif;
            font-size: 13px;
            font-weight: 700;
            color: ${goldColor};
            letter-spacing: 2px;
            margin-top: 8px;
            border-top: 1px solid rgba(212, 175, 55, 0.3);
            border-bottom: 1px solid rgba(212, 175, 55, 0.3);
            padding: 4px 20px;
            display: inline-block;
          }
          .cert-body {
            margin: 6px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .award-stmt {
            font-family: Georgia, serif;
            font-size: 9px;
            font-style: italic;
            color: #475569;
            margin: 0;
          }
          .name {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 800;
            color: ${navyColor};
            margin: 4px 0;
            border-bottom: 1px solid rgba(15, 28, 63, 0.15);
            padding-bottom: 1px;
            min-width: 240px;
          }
          .desc {
            font-size: 9px;
            color: #334155;
            margin: 3px 0;
            max-width: 440px;
            line-height: 1.3;
          }
          .score-box {
            display: inline-flex;
            background-color: #fffbeb;
            border: 1px dashed ${goldColor};
            padding: 2px 10px;
            border-radius: 6px;
            margin: 4px 0;
          }
          .score-text {
            font-size: 14px;
            font-weight: 900;
            color: #b45309;
          }
          .footer-section {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 4px;
          }
          .footer-col {
            width: 140px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .signature-script {
            font-family: 'Pinyon Script', cursive;
            font-size: 15px;
            color: #0d9488;
            transform: rotate(-3deg);
            margin-bottom: -4px;
          }
          .sig-line {
            width: 90%;
            height: 1px;
            background-color: rgba(15, 28, 63, 0.3);
          }
          .sig-label {
            font-size: 7px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .seal-col {
            position: relative;
            width: 50px;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .seal-body {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: radial-gradient(circle, #f59e0b, #d97706);
            border: 1.5px dashed #b45309;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .seal-inner {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.3);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #ffffff;
            font-size: 6px;
            font-weight: 900;
          }
          .qr-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100px;
          }
          .qr-code {
            width: 50px;
            height: 50px;
          }
          .id-text {
            font-size: 6.5px;
            font-weight: 700;
            color: #64748b;
            font-family: monospace;
            margin-top: 2px;
          }
          .level-ribbon {
            position: absolute;
            top: 0;
            right: 15px;
            background: linear-gradient(135deg, ${goldColor}, #b49020);
            color: #ffffff;
            font-size: 7px;
            font-weight: 800;
            padding: 4px 8px;
            text-transform: uppercase;
            border-radius: 0 0 4px 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="cert-paper">
          <div class="outer-border">
            <div class="inner-border">
              <div class="watermark-cross">✚</div>
              <div class="watermark-cross-left">✚</div>
              
              <div class="level-ribbon">${levelText}</div>

              <div class="cert-header">
                <div class="logo">SAMU</div>
                <div class="logo-sub">Smart App for Medical University</div>
                <div class="banner">CERTIFICATE OF EXCELLENCE</div>
              </div>

              <div class="cert-body">
                <p class="award-stmt">This certificate is proudly awarded to</p>
                <h2 class="name">${cert.student_name}</h2>
                <p class="desc">for demonstrating exceptional academic performance by achieving</p>
                <div class="score-box">
                  <span class="score-text">${Number(cert.score).toFixed(1)}%</span>
                </div>
                <p class="desc">in the coursework exam of <strong>${cert.subject_name}</strong> completed on <strong>${cert.completion_date}</strong>.</p>
              </div>

              <div class="footer-section">
                <div class="footer-col">
                  <div class="signature-script">Academic Excellence Board</div>
                  <div class="sig-line"></div>
                  <span class="sig-label">Academic Board, SAMU</span>
                </div>

                <div class="seal-col">
                  <div class="seal-body">
                    <div class="seal-inner">
                      <span>SAMU</span>
                      <span>•</span>
                      <span>SSMU</span>
                    </div>
                  </div>
                </div>

                <div class="qr-col">
                  <img class="qr-code" src="${qrCodeUrl}" />
                  <span class="id-text">${cert.certificate_id}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleShare = async () => {
    const shareText = `🏆 I scored ${Number(cert.score).toFixed(1)}% in ${cert.subject_name} on SAMU MCQs! Verify my certificate here: ${verificationUrl}`;
    try {
      await Share.share({
        message: shareText,
        url: verificationUrl // iOS only
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const html = getCertificateHtml();
      
      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html,
        width: 612, // US Letter width (landscape equivalent)
        height: 792 // US Letter height
      });

      // Share PDF directly (allows save to Files, AirDrop, messaging, etc.)
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save Certificate' });
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert('Download Failed', 'Could not export certificate as PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Academic Certificate</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* WebView displaying the certificate */}
      <View style={styles.webContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: getCertificateHtml() }}
          style={styles.webview}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Controls */}
      <View style={[styles.actions, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
          onPress={handleDownloadPdf}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Download size={18} color={colors.text} />
              <Text style={[styles.btnText, { color: colors.text }]}>PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
          onPress={handleShare}
        >
          <Share2 size={18} color={colors.text} />
          <Text style={[styles.btnText, { color: colors.text }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
          onPress={handleCopyLink}
        >
          {copied ? (
            <>
              <Check size={18} color="#10B981" />
              <Text style={[styles.btnText, { color: '#10B981' }]}>Copied</Text>
            </>
          ) : (
            <>
              <Copy size={18} color={colors.text} />
              <Text style={[styles.btnText, { color: colors.text }]}>Link</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 25,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  webContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    minWidth: 90,
  },
  btnText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: 'bold',
  }
});

export default CertificateViewScreen;
