cask "duosound" do
  version "1.0"
  sha256 :no_check

  url "https://duosound.tejastelkar.com/assets/DuoSound-1.0.dmg"
  name "DuoSound"
  desc "Native macOS dual output audio streaming"
  homepage "https://duosound.tejastelkar.com"

  depends_on macos: ">= :ventura"

  app "DuoSound.app"

  zap trash: [
    "~/Library/Application Support/DuoSound",
    "~/Library/Preferences/com.tejas.duosound.plist",
  ]
end
