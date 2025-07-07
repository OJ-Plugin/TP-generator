const current_tag = [1, 2, 2];

function checkUpdate() {
  var l = $("body").lyearloading({
    opacity: 0.2,
    spinnerSize: "lg",
    spinnerText: "检查更新中，请稍后...",
    textColorClass: "text-purple",
    spinnerColorClass: "text-purple",
  });
  const settings = {
    async: true,
    crossDomain: true,
    url: "https://api.github.com/repos/OJ-Plugin/TP-generator/releases/latest",
    method: "GET",
  };

  $.ajax(settings).done(function (response) {
    const latest_tag = response.tag_name.split("v")[1].split(".");
    const current_tag_display = current_tag.join(".");
    const latest_tag_display = latest_tag.join(".");
    if (latest_tag[0] > current_tag[0] || (latest_tag[0] == current_tag[0] && latest_tag[1] > current_tag[1]) || (latest_tag[0] == current_tag[0] && latest_tag[1] == current_tag[1] && latest_tag[2] > current_tag[2])) {
      $.alert({
        title: "检查更新",
        content: "检查到有新的版本可供升级！" + current_tag_display + "->" + latest_tag_display,
        icon: "mdi mdi-rocket",
        animation: "scale",
        closeAnimation: "scale",
        buttons: {
          okay: {
            text: "立即前往下载",
            btnClass: "btn-blue",
            action: function () {
              window.open("https://github.com/OJ-Plugin/TP-generator/releases/latest", "_blank");
            },
          },
        },
      });
    } else {
      l.destroy();
      $.notify(
        {
          icon: "mdi mdi-check-circle-outline",
          title: "检查更新",
          message: "已是最新版本！",
        },
        {
          type: "success",
          allow_dismiss: true,
          newest_on_top: false,
          placement: {
            from: "top",
            align: "right",
          },
          offset: {
            x: 20,
            y: 20,
          },
          spacing: 10,
          z_index: 1031,
          delay: 5000,
          animate: {
            enter: "animate__animated animate__fadeInDown",
            exit: "animate__animated animate__fadeOutUp",
          },
          onClosed: () => {},
          mouse_over: null,
        }
      );
    }
  });
}
