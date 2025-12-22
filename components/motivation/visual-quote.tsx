"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const QUOTES = [
    // --- CHỦ ĐỀ: GIA ĐÌNH & ĐẠO HIẾU ---
    "Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong nguồn chảy ra.",
    "Một lòng thờ mẹ kính cha, Cho tròn chữ hiếu mới là đạo con.",
    "Anh em như thể tay chân, Rách lành đùm bọc dở hay đỡ đần.",
    "Khôn ngoan đối đáp người ngoài, Gà cùng một mẹ chớ hoài đá nhau.",
    "Con có cha như nhà có nóc, Con không cha như nòng nọc đứt đuôi.",
    "Cá không ăn muối cá ươn, Con cãi cha mẹ trăm đường con hư.",
    "Chị ngã em nâng.",
    "Công cha nghĩa mẹ cao vời, Đạo làm con chữ hiếu thời ghi tâm.",

    // --- CHỦ ĐỀ: THẦY CÔ & HỌC TẬP ---
    "Muốn sang thì bắc cầu Kiều, Muốn con hay chữ thì yêu lấy thầy.",
    "Tiên học lễ, hậu học văn.",
    "Một chữ cũng là thầy, nửa chữ cũng là thầy.",
    "Không thầy đố mày làm nên.",
    "Học thầy không tày học bạn.",
    "Ăn vóc học hay.",
    "Đi một ngày đàng, học một sàng khôn.",
    "Muốn biết phải hỏi, muốn giỏi phải học.",

    // --- CHỦ ĐỀ: ĐẠO ĐỨC & LỐI SỐNG ---
    "Ăn quả nhớ kẻ trồng cây.",
    "Uống nước nhớ nguồn.",
    "Lá lành đùm lá rách.",
    "Một con ngựa đau, cả tàu bỏ cỏ.",
    "Bầu ơi thương lấy bí cùng, Tuy rằng khác giống nhưng chung một giàn.",
    "Nhiễu điều phủ lấy giá gương, Người trong một nước phải thương nhau cùng.",
    "Thương người như thể thương thân.",
    "Ở hiền gặp lành.",
    "Cây ngay không sợ chết đứng.",
    "Đói cho sạch, rách cho thơm.",
    "Tốt gỗ hơn tốt nước sơn.",
    "Gần mực thì đen, gần đèn thì rạng.",

    // --- CHỦ ĐỀ: KINH NGHIỆM SỐNG & LAO ĐỘNG ---
    "Có công mài sắt, có ngày nên kim.",
    "Ai ơi bưng bát cơm đầy, Dẻo thơm một hạt đắng cay muôn phần.",
    "Nhất nước, nhì phân, tam cần, tứ giống.",
    "Tấc đất tấc vàng.",
    "Chớ thấy sóng cả mà ngã tay chèo.",
    "Thất bại là mẹ thành công.",
    "Sai một li, đi một dặm.",
    "Lời nói chẳng mất tiền mua, Lựa lời mà nói cho vừa lòng nhau.",
    "Đoàn kết thì sống, chia rẽ thì chết.",
    "Mềm nắn rắn buông.",

    // --- CHỦ ĐỀ: TÌNH YÊU & QUÊ HƯƠNG ---
    "Anh đi anh nhớ quê nhà, Nhớ canh rau muống nhớ cà dầm tương.",
    "Thân em như chẻ tre, Như lụa đào phất phơ giữa chợ.",
    "Trèo lên cây bưởi hái hoa, Bước xuống vườn cà lừa những nụ tầm xuân.",
    "Cần Thơ gạo trắng nước trong, Ai đi đến đó lòng không muốn về.",

    // --- TỤC NGỮ NGẮN GỌN ---
    "Máu chảy ruột mềm.",
    "Môi hở răng lạnh.",
    "Lửa thử vàng, gian nan thử sức.",
    "Năng nhặt chặt bị.",
    "Kiến tha lâu cũng đầy tổ.",
    "Nước chảy đá mòn.",
    "Ếch ngồi đáy giếng.",
    "Gậy ông đập lưng ông.",
    "Vỏ quýt dày có móng tay nhọn.",
    "Đứng núi này trông núi nọ.",
    "Của ít lòng nhiều.",
    "Vạn sự khởi đầu nan.",
    "Tránh vỏ dưa, gặp vỏ dừa.",
    "Tham bát bỏ mâm.",
    "Tiền nào của nấy.",
    "Trâu buộc ghét trâu ăn.",
    "Họa vô đơn chí.",
    "Tai vách mạch rừng.",
    "Ngưu tầm ngưu, mã tầm mã.",
    "Thùng rỗng kêu to.",
    "Cưỡi ngựa xem hoa.",
    "Mắt không thấy, tim không đau.",
    "Dã tràng xe cát.",
    "Khéo ăn thì no, khéo co thì ấm.",
    "Đen bạc đỏ tình.",
    "Cờ đến tay ai nấy phất.",
    "Có thực mới vực được đạo.",
    "Vắng chủ nhà gà mọc đuôi tôm.",
    "Cháy nhà mới ra mặt chuột.",
    "Mất bò mới lo làm chuồng.",
    "Nước đến chân mới nhảy.",
    "Vung tay quá trán.",
    "Nuôi ong tay áo.",
    "Lòng lang dạ thú.",
    "Khẩu xà tâm phật.",
    "Gieo gió gặt bão.",
    "Tiền mất tật mang.",
    "Sống để bụng chết mang theo.",
    "Của thiên trả địa.",
    "Kẻ tung người hứng.",
    "Trống đánh xuôi kèn thổi ngược.",
    "Đâm lao thì phải theo lao.",
    "Đi đêm lắm có ngày gặp ma.",
    "Của bền tại người.",
    "Người đẹp vì lụa, lúa tốt vì phân.",
    "Một mất mười ngờ.",
    "Của một đồng công một nén.",
    "Tháng bảy nước nhảy lên bờ.",
    "Chuồn chuồn bay thấp thì mưa, Bay cao thì nắng, bay vừa thì râm.",
    "Đêm tháng năm chưa nằm đã sáng, Ngày tháng mười chưa cười đã tối."
];

export function VisualQuote() {
    const [quote, setQuote] = useState("");

    useEffect(() => {
        // Pick a random quote on mount
        const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(random);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center opacity-80 hover:opacity-100 transition-opacity">
            <Quote className="h-6 w-6 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground italic font-serif leading-relaxed max-w-xs">
                "{quote}"
            </p>
        </div>
    );
}
