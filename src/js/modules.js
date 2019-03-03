$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});


$(document).ready(function () {
    $("#txtStockSearch").on("keyup", function () {
        console.log("Pressed");
        var filter = $(this).val().toLowerCase();
        $("#myStocks li #stocktitle").each(function () {
            if (filter == "") {
                $(this).parent().css("visibility", "visible");
                $(this).parent().fadeIn();
            } else if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                $(this).parent().css("visibility", "hidden");
                $(this).parent().fadeOut();
            } else {
                $(this).parent().css("visibility", "visible");
                $(this).parent().fadeIn();
            }
        });

    });
});