import { vi } from 'vitest';

export interface Props {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  headers?: Record<string, string>;
  blob?: Blob;
}

export const messageMock = (overrides: Partial<Props> = {}): ForwardableEmailMessage => {
  const from = typeof overrides.from !== 'undefined' ? overrides.from : 'sender@example.com';
  const to = typeof overrides.to !== 'undefined' ? overrides.to : 'ntfy-alert@example.com';
  const subject = typeof overrides.subject !== 'undefined' ? overrides.subject : 'CRITICAL Alarm on i-2234u23948';
  const body =
    typeof overrides.body !== 'undefined'
      ? overrides.body
      : 'Your Amazon CloudWatch alarm was triggered. Please check the details below:\n\nAlarm Name: CRITICAL Alarm on i-2234u23948\nAlarm Description: This alarm monitors the CPU usage of your EC2 instance.\n\n--\nRegards\nTest User';
  const headers = typeof overrides.headers !== 'undefined' ? overrides.headers : {};
  const blob =
    typeof overrides.blob !== 'undefined'
      ? overrides.blob
      : new Blob([createRawEmail(from, to, subject, body)], { type: 'text/plain' });

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


