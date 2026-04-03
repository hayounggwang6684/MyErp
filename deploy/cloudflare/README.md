# Cloudflare Tunnel 준비 메모

이 디렉터리는 `sunjincmk-dev.site`를 Cloudflare Tunnel로 연결할 때 사용할 설정 예시를 둔다.

## 전제 조건

- Cloudflare에 `sunjincmk-dev.site`가 추가되어 있어야 한다.
- Namecheap nameserver가 Cloudflare nameserver로 변경되어 있어야 한다.
- Cloudflare 상태가 `Active`여야 한다.
- Mac mini에서 ERP 서버가 `127.0.0.1:3000`으로 실행 중이어야 한다.

## 1. Cloudflare 로그인

```bash
cloudflared tunnel login
```

브라우저가 열리면 Cloudflare zone으로 `sunjincmk-dev.site`를 선택한다.

## 2. 터널 생성

```bash
cloudflared tunnel create sunjin-erp
```

출력되는 `tunnel id`를 기록한다.

## 3. 설정 파일 작성

`config.yml.example`를 복사해 실제 설정 파일을 만든다.

```bash
mkdir -p ~/.cloudflared
cp deploy/cloudflare/config.yml.example ~/.cloudflared/config.yml
```

그리고 아래 두 값을 실제 값으로 바꾼다.

- `tunnel`
- `credentials-file`

## 4. DNS 라우팅 생성

```bash
cloudflared tunnel route dns sunjin-erp sunjincmk-dev.site
cloudflared tunnel route dns sunjin-erp app.sunjincmk-dev.site
cloudflared tunnel route dns sunjin-erp www.sunjincmk-dev.site
```

## 5. 터널 실행

```bash
cloudflared tunnel run sunjin-erp
```

## 6. 서비스 등록

터미널을 닫아도 유지하려면 사용자 서비스로 올린다.

```bash
launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.sunjin.erp.cloudflared.plist
launchctl kickstart -k "gui/$(id -u)/com.sunjin.erp.cloudflared"
```

서비스 실행 전 `~/.cloudflared/config.yml`이 실제 tunnel 정보로 채워져 있어야 한다.

## 7. Cloudflare Access 추가 보호

브라우저 직접 접근을 한 번 더 줄이려면 Cloudflare Zero Trust에서 `Self-hosted` 애플리케이션으로 `sunjincmk-dev.site`를 추가하고 `Service Auth` 정책을 건다.

Cloudflare Access 서비스 토큰 방식은 아래 두 헤더를 초기 요청에 보낸다.

- `CF-Access-Client-Id`
- `CF-Access-Client-Secret`

Electron 클라이언트는 `client/constants.js`의 `cloudflareAccess` 블록이 활성화되면 이 헤더를 자동으로 보낸다.

```js
cloudflareAccess: {
  enabled: true,
  clientId: "발급받은 Client ID",
  clientSecret: "발급받은 Client Secret",
}
```

운영 시에는 민감정보를 `client/constants.js`에 직접 두지 말고, Git에 포함되지 않는 `client/constants.local.js`로 덮어쓴다.

```js
module.exports = {
  serverUrl: "https://sunjincmk-dev.site",
  cloudflareAccess: {
    enabled: true,
    clientId: "발급받은 Client ID",
    clientSecret: "발급받은 Client Secret",
  },
};
```

예시는 `client/constants.local.example.js`를 참고한다.

권장 순서:

1. Cloudflare Zero Trust에서 `Self-hosted` 앱 `sunjincmk-dev.site` 생성
2. `Service Token` 생성
3. 앱 정책에 `Service Auth` 허용 규칙 연결
4. 위 토큰 값을 `client/constants.local.js`에 반영
5. GitHub Actions 릴리즈를 쓸 경우 저장소 시크릿 `CLOUDFLARE_ACCESS_CLIENT_ID`, `CLOUDFLARE_ACCESS_CLIENT_SECRET`도 함께 설정
6. Windows 클라이언트를 재빌드/재배포

주의:

- 서비스 토큰을 전용 클라이언트에 넣는 방식은 브라우저 직접 접근 차단에는 유용하지만, 토큰이 클라이언트 안에 존재한다는 점에서 완전한 기기 기반 보안은 아니다.
- 더 강한 기기 기반 정책이 필요하면 Tailscale 같은 사설망 방식을 별도로 검토한다.
