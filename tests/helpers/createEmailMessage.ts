import { vi } from 'vitest';

export interface Props {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  headers?: Record<string, string>;
  blob?: Blob;
}

export const messageMock = (overrides: Partial<Props> = {}, useAlternateTemplate = false, includePlaintext = true): ForwardableEmailMessage => {
  const from = typeof overrides.from !== 'undefined' ? overrides.from : 'sender@example.com';
  const to = typeof overrides.to !== 'undefined' ? overrides.to : 'ntfy-alert@example.com';
  const subject = typeof overrides.subject !== 'undefined' ? overrides.subject : 'CRITICAL Alarm on i-2234u23948';
  const body =
    typeof overrides.body !== 'undefined'
      ? overrides.body
      : 'Your Amazon CloudWatch alarm was triggered. Please check the details below:\n\nAlarm Name: CRITICAL Alarm on i-2234u23948\nAlarm Description: This alarm monitors the CPU usage of your EC2 instance.\n\n--\nRegards\nTest User';
  const headers = typeof overrides.headers !== 'undefined' ? overrides.headers : {};

  const rawEmailContent = useAlternateTemplate
    ? createRawEmail2(from, to, subject, body, includePlaintext)
    : createRawEmail(from, to, subject, body, includePlaintext);

  const blob =
    typeof overrides.blob !== 'undefined'
      ? overrides.blob
      : new Blob([rawEmailContent], { type: 'text/plain' });

  const message: ForwardableEmailMessage = {
    from,
    to,
    headers: new Headers(),
    raw: blob.stream(),
    rawSize: blob.size,
    setReject: vi.fn(),
    forward: vi.fn(),
  };
  return message;
};

export function invalidMessageMock(content: string): ForwardableEmailMessage {
  const message: ForwardableEmailMessage = {
    setReject: vi.fn(),
    forward: vi.fn(),
    reply: vi.fn(),
  };

  return message;
}

const createRawEmail = (from: string, to: string, subject: string, body: string) => {
  return `Delivered-To: ${to}
Received: by 2002:a25:abb4:0:b0:e5e:23c7:36d1 with SMTP id v49csp259557ybi;
        Tue, 11 Mar 2025 13:54:11 -0700 (PDT)
X-Google-Smtp-Source: AGHT+IG/taTccNFxH5wtLvehUlE/Kqzb4Uz9J27ykYx8ICr5vCodh9PC/YDjNXwgdsiAaZXUQWbo
X-Received: by 2002:a05:600c:4446:b0:439:4700:9eb3 with SMTP id 5b1f17b1804b1-43c5a5e4fbamr142340435e9.3.1741726451045;
        Tue, 11 Mar 2025 13:54:11 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1741726451; cv=none;
        d=google.com; s=arc-20240605;
        b=Q6S+YIQzUACfzmhj8MmW4EAsAfJwEV0kdlXmMmX/BNY7Y08VlPzv+wQPLZrmsklpxb
         xF9tiyuV7qwl6hutbJoYoqQ7nxeovRkSX3cT0uptBquxKLz8JXrLMPGUsaBesE4IAi1Z
         T3CDBT/cDU4sCCPPBqPeywUo2MFNVp9KSxqDhkDxwNY99qwCyheaRTmPD5i9jRmx7WrR
         atd2eZxWj+gNB/DztSCwRrHqgN01oRK5yyBna3aDyXcfEEGIjZyOrM32MrNNixuuiZ1d
         VrsjPT1XzFwI4r/S25vL9UCJDQpJbQfCFtxNus/+9zTdPQWQT8nXYok0vvihEwWTfrq5
         ZM9Q==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20240605;
        h=mime-version:feedback-id:message-id:subject:from:to:date;
        bh=UV9RQm11PPYMux2nY27AxQ9qDBwOhfnnQlCGTeBaT4s=;
        fh=9UC8JkBoHxQmrjm5NXKY+LX5/jw85C9Qf1awCfO8oFA=;
        b=VMKf3gwk1qOkVKHIRJwcyGQrj79il4KFeq2F6FRfJw5qasoHhc2Y6ZEPUKblfYHsMF
         Phk/h+f87nqLbFQ2xgPAzb6ob7nPPQpqidejBY74IdegNdfp4kAdtSjarVOE7yCJvlCM
         z1TlWo2JrgmeJSujJPyQ54Wxm8s+qkBnBi0StRQUiq1G3gyd53FnPNAkax6+UlnE+GM/
         3itH7mbQ33KqKoctv/RDGJoPDT7Q4Ke7H82/K6EMLWD1bVct24AUt+MwM+r/z1mQQukk
         vVKIYvlx7fUNCgDhvfTL2expOLLFy2o4i/JUqyNvqaZ3W4rtE017p9bedoG7tyRKceSe
         gq5Q==;
        dara=google.com
ARC-Authentication-Results: i=1; mx.google.com;
       spf=pass (google.com: domain of ${from} designates 185.70.42.121 as permitted sender) smtp.mailfrom=${from};
       dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=xref.dev
Return-Path: <${from}>
Received: from mail-40136.protonmail.ch (mail-40136.protonmail.ch. [185.70.42.121])
        by mx.google.com with ESMTPS id ffacd0b85a97d-3912c0e248fsi9558397f8f.331.2025.03.11.13.54.10
        for <$to>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Tue, 11 Mar 2025 13:54:10 -0700 (PDT)
Received-SPF: pass (google.com: domain of ${from} designates 185.70.42.121 as permitted sender) client-ip=185.70.42.121;
Authentication-Results: mx.google.com;
       spf=pass (google.com: domain of ${from} designates 185.70.40.136 as permitted sender) smtp.mailfrom=${from};
       dmarc=pass (p=QUARANTINE sp=QUARANTINE dis=NONE) header.from=xref.dev
Date: Tue, 11 Mar 2025 20:54:05 +0000
To: ${to}
From: First Last <${from}>
Subject: ${subject}
Message-ID: <GgcktD-pCg6-hEI_iPVXGw8wqLDxPtlBFEoWlfJfd5WsyzGkxLcjlxBKjvL_yNfSTTe4vicQHwFI6mWyqkJ4EYWXYj3hTnuAa9RHH-tN6t8=@xref.dev>
Feedback-ID: 99745742:user:proton
X-Pm-Message-ID: ad5fc1176c7a961732afca009d7f8e075ce223de
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="b1=_STtzQmxHk3AWtjYhzNK3ys8S83s7D7Qu7GTkNxEe2A"

--b1=_STtzQmxHk3AWtjYhzNK3ys8S83s7D7Qu7GTkNxEe2A
Content-Type: text/plain; charset=utf-8

${body}

--b1=_STtzQmxHk3AWtjYhzNK3ys8S83s7D7Qu7GTkNxEe2A
Content-Type: text/html; charset=utf-8

<html>
<head>
<style>
* {
font-family:Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
</style>
</head>
<body>
${body}
</body>
</html>

--b1=_STtzQmxHk3AWtjYhzNK3ys8S83s7D7Qu7GTkNxEe2A
Content-Type: text/plain; name="attachment.txt"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="attachment.txt"

VGhpcyBpcyBhbiBhdHRhY2htZW50Lg==

--b1=_STtzQmxHk3AWtjYhzNK3ys8S83s7D7Qu7GTkNxEe2A--`
}

const createRawEmail2 = (from: string, to: string, subject: string, body: string) => {
  return `Delivered-To: ${to}
Received: by 2002:a17:504:7b62:b0:1c6f:f9dc:4385 with SMTP id an2csp262844njc;
        Fri, 21 Mar 2025 05:00:50 -0700 (PDT)
X-Google-Smtp-Source: AGHT+IFyFWLVdBIjMquI6dWReVLafDhU94KhbiKdGu267giWOKJNd5aP8A/yNvu4e00rvvBgqmuG
X-Received: by 2002:a17:902:f608:b0:210:f706:dc4b with SMTP id d9443c01a7336-22780c7606emr44764965ad.13.1742558449980;
        Fri, 21 Mar 2025 05:00:49 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1742558449; cv=none;
        d=google.com; s=arc-20240605;
        b=fYJQEW5Tv5qRVotzU7Lk1zQtU8C5RZ70cpsJZWUFc/mNpIEyT6bihRiZnBlO1GMOlV
         rdDg4pON8EN/XIpQ8Vn52xi/X4Y8ZVOPt6EdVRbJL+G+MbElpXhVvAVQNBPaXbcZc8cw
         iB82CvHZBkGeYWSuyRMxy+bS3xqcRu7879f/OdVOrM1Hm7JZ4QjAan/MVcurznIkCqI7
         BPGeYCOvP7TqGPAGGdqXZ2x6Ov0/BB323CpPjrX32Sv4bpKtcg9gUi9L+uZAZODz7xRd
         zfKqTli7T95Y7V+38utl+a51puKM5Q9vjzrSM3RejNeiwynlTR42oGUOw8LUfKl+JFdq
         F80Q==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20240605;
        h=feedback-id:mime-version:subject:message-id:to:from:date:sender
         :dkim-signature;
        bh=MwtW/9FPRcUj7dE+GALRB3j9C8LUrF7K0flYQhXzLvE=;
        fh=vdXGp1wcp8KsRC+afP2VyEYmWfym+wDtuU3TnK72gtY=;
        b=VABFlIF6glyhk1uOgAgHPVGlFu27niMo/99IIBBgOJmh1p6j3f6Y2kyBgY/CHbmJl6
         IV69YMzLjINcPwyi2Kkyztbc3YUq369LL1Kf43SSeXcYQac3LU3GRT6/y1KmrgV3v0tw
         zgHoLBtQPRbVAAMUi6gu+sQ5FCW7vgj/JiiKRJRtWDphL9PgTFoeHYcXMbrvowN66be1
         Mxwa4aVKJGOIfiPlby+pEcPt0SOXXdykLtvfg9xlb4r42m6iBEEjZxc965/d04EZe3Jh
         nDfgB4XpchBBfrQ9R66dLTBfSzR2ytTY25k7ad781hWQ8PVJWp/aTiOnMflkT9Ok1WqI
         V5ug==;
        dara=google.com
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass header.i=@opsgenie.net header.s=smtp header.b=Mdof3NMG;
       spf=pass (google.com: domain of bounce+a9590b.9a53-${to}@opsgenie.net designates 198.244.56.105 as permitted sender) smtp.mailfrom="bounce+a9590b.9a53-${to}@opsgenie.net";
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=opsgenie.net
Return-Path: <bounce+a9590b.9a53-${to}@opsgenie.net>
Received: from c105.c5341538.usw1.send.mailgun.net (c105.c5341538.usw1.send.mailgun.net. [198.244.56.105])
        by mx.google.com with UTF8SMTPS id 41be03b00d2f7-af8a27dd19esi3140072a12.142.2025.03.21.05.00.49
        for <${to}>
        (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256 bits=128/128);
        Fri, 21 Mar 2025 05:00:49 -0700 (PDT)
Received-SPF: pass (google.com: domain of bounce+a9590b.9a53-${to}@opsgenie.net designates 198.244.56.105 as permitted sender) client-ip=198.244.56.105;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@opsgenie.net header.s=smtp header.b=Mdof3NMG;
       spf=pass (google.com: domain of bounce+a9590b.9a53-${to}@opsgenie.net designates 198.244.56.105 as permitted sender) smtp.mailfrom="bounce+a9590b.9a53-${to}@opsgenie.net";
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=opsgenie.net
DKIM-Signature: a=rsa-sha256; v=1; c=relaxed/relaxed; d=opsgenie.net; q=dns/txt; s=smtp; t=1742558449; x=1742565649; h=Content-Type: MIME-Version: Subject: Subject: Message-ID: To: To: From: From: Date: Sender: Sender; bh=MwtW/9FPRcUj7dE+GALRB3j9C8LUrF7K0flYQhXzLvE=; b=Mdof3NMG5a/zz3pO02aYSIHhGDdYbc4SSS6gGOwumYZ3Gj94NlKEs5rUJyI+LW/bTImIef7fUPrx2gz1j1U5wgXpWWeeKwo4FKJ2WboSl1aJwj7WgHFsP9UWS3mh99JAIhOcVoVDp240Xk7t1MkhrnDrNW2xl9gRkt5a/N6YbbU=
X-Mailgun-Sending-Ip: 198.244.56.105
X-Mailgun-Sending-Ip-Pool-Name: 
X-Mailgun-Sending-Ip-Pool: 
X-Mailgun-Sid: WyI1YmFmZCIsInNoYXJqZWVsLmF6aXpAY2l2aWNhY3Rpb25zLmNvbSIsIjlhNTMiXQ==
Received: by 37eb749d6cbb with HTTP id 67dd54e9bbb30a8f3f0bfaea; Fri, 21 Mar 2025 12:00:41 GMT
Sender: ${from}
X-Mailgun-Variables: {"notificationId": "577d3df1-a6fb-4a0d-98eb-6f22c73dc09e"}
Date: Fri, 21 Mar 2025 12:00:41 +0000 (GMT)
From: Opsgenie <${from}>
To: ${to}
Message-ID: <not.577d3df1-a6fb-4a0d-98eb-6f22c73dc09e.20250321.120041.786.email@opsgenie.net>
Subject: Your on-call rotation for NSF_schedule is starting now
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_2831864_1041926139.1742558441786"
Feedback-ID: ip.og-mailgun:pr.opsgenie:la.og/schedule-start:og-mail-out

------=_Part_2831864_1041926139.1742558441786
Content-Type: multipart/related; boundary="----=_Part_2831865_1375103509.1742558441786"

------=_Part_2831865_1375103509.1742558441786
Content-Type: multipart/alternative; boundary="----=_Part_2831866_1187114340.1742558441786"

------=_Part_2831866_1187114340.1742558441786
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

${body}

------=_Part_2831866_1187114340.1742558441786
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

<!DOCTYPE html>
<html lang=3D"en">
<head>
    <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3DUTF-8=
">
    <meta name=3D"viewport" content=3D"width=3Ddevice-width"/>
</head>
<body style=3D"width: 100% !important; min-width: 100%; -webkit-text-size-a=
djust: 100%; -ms-text-size-adjust: 100%; text-align: left; background: #fff=
fff; margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;"
      bgcolor=3D"#ffffff">
<table class=3D"body"
       style=3D"border-spacing: 0; border-collapse: collapse; vertical-alig=
n: top; text-align: left; height: 100%; width: 100%; margin: 60px 0px 30px =
0px; padding: 0px 0px 0px 0px; background-color: #ffffff;">
    <tbody>
    <tr style=3D"vertical-align: top; text-align: left; padding: 0;" align=
=3D"left">
        <td align=3D"left" valign=3D"top"
            style=3D"-webkit-hyphens: auto; -moz-hyphens: auto; hyphens: au=
to; border-collapse: collapse !important; vertical-align: top; text-align: =
left; margin: 0; padding: 0;">
            <!-- head image -->
            <table class=3D"twelve columns"
                   style=3D"max-width: 800px; border-spacing: 0; border-col=
lapse: collapse; vertical-align: top; text-align: left; margin: 0px 3% 0px =
3%; padding: 0px 0px 0px 0px;">
                <tbody>
                <tr style=3D"vertical-align: top; text-align: left; padding=
: 0;" align=3D"left">
                    <td style=3D"-webkit-hyphens: auto; -moz-hyphens: auto;=
 hyphens: auto; border-collapse: collapse !important; vertical-align: top; =
margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;"
                        align=3D"left" valign=3D"top">
                        <img
                             src=3D"https://resources.opsgenie.com/resource=
s/images/email/logo.png"
                             alt=3D"Logo Image"
                             style=3D"outline: none; text-decoration: none;=
 -ms-interpolation-mode: bicubic; width: auto; max-width: 100%; float: left=
; clear: both; display: block;"
                             align=3D"left"></td>
                    <td class=3D"expander"
                        style=3D"-webkit-hyphens: auto; -moz-hyphens: auto;=
 hyphens: auto; border-collapse: collapse !important; vertical-align: top; =
text-align: left; visibility: hidden; width: 0px; margin: 0px 0px 0px 0px; =
padding: 0px 0px 0px 0px;"
                        align=3D"left" valign=3D"top"></td>
                </tr>
                </tbody>
            </table>
            <!-- hr -->
            <table class=3D"twelve columns"
                   style=3D"width: 90%; border-spacing: 0; border-collapse:=
 collapse; vertical-align: top; text-align: left; margin: 0px 3% 10px 3%; p=
adding: 0px 0px 0px 0px;">
                <tbody>
                <tr style=3D"vertical-align: top; text-align: left; padding=
: 0;" align=3D"left">
                    <td style=3D"background:none; border-bottom: 2px solid =
#DFDFDF; height:1px; width:100%; margin:0px 0px 0px 0px;">
                        &nbsp;
                    </td>
                    <td class=3D"expander"
                        style=3D"-webkit-hyphens: auto; -moz-hyphens: auto;=
 hyphens: auto; border-collapse: collapse !important; vertical-align: top; =
text-align: left; visibility: hidden; width: 0px; margin: 0px 0px 0px 0px; =
padding: 0px 0px 0px 0px;"
                        align=3D"left" valign=3D"top"></td>
                </tr>
                </tbody>
            </table>
            <table class=3D"twelve columns"
                               style=3D"max-width: 800px; border-spacing: 0=
; border-collapse: collapse; vertical-align: top; text-align: left; margin:=
 60px 4% 0px 4%; padding: 0px 0px 0px 0px;">
                <tbody>
                <tr style=3D"vertical-align: top; text-align: left; padding=
: 0;" align=3D"left">
                    <td style=3D"word-break: break-word; -webkit-hyphens: a=
uto; -moz-hyphens: auto; hyphens: auto; border-collapse: collapse !importan=
t; vertical-align: top; text-align: left; color: #434945; font-family: 'Hel=
vetica', 'Arial', sans-serif; font-weight: normal; line-height: 19px; font-=
size: 14px; margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;"
                        align=3D"left" valign=3D"top">
                    <!-- content start -->
                    ${body} 
                    <!-- content end -->
                        </td>
                    </tr>
                </tbody>
            </table>
        </td>
    </tr>
    </tbody>
</table>
<img width=3D"1" height=3D"1" alt=3D"" src=3D"http://email.opsgenie.net/o/e=
JyMzM1t6zAMAOBpopsFktafDxrgjUGJ1AuLRCpiI4dMX3SDLvBJPTjuTivmQDGWEA53r4MGMJYi=
RNqyhJJ6ShEp60CU1pzVuS4fc5ZdBm6cRtsCg2xH0balQdTzLh0O9QQUYSf0SAABfS7J65PtcQu=
wvs__Ok391MvNddmwzpet-U_qX3D3quedX1-qD88f-9wCdHtb5_6LnL6vp3tX-gkAAP__1ydEMg=
"></body>
</html>
------=_Part_2831866_1187114340.1742558441786--
------=_Part_2831865_1375103509.1742558441786--
------=_Part_2831864_1041926139.1742558441786--`
}