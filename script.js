/* =====================================================
   NIKI FAMILY
   JavaScript + Supabase
   ===================================================== */


/* =====================================================
   SUPABASE SETTINGS
   ===================================================== */

const SUPABASE_URL =
    "https://jjoxrvcstonuzvfutcbl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_P2aV9jQxA9rTqkeXHdu23w_s5-HbjyC";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   VARIABLES
   ===================================================== */

let topics = [];

let currentTopicId = null;


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupButtons();

        loadTopics();

    }
);


/* =====================================================
   BUTTONS
   ===================================================== */

function setupButtons() {

    const createButton =
        document.getElementById(
            "createTopicButton"
        );

    const closeTopicButton =
        document.getElementById(
            "closeTopicModal"
        );

    const closeViewButton =
        document.getElementById(
            "closeTopicView"
        );

    const submitTopicButton =
        document.getElementById(
            "submitTopicButton"
        );

    const submitReplyButton =
        document.getElementById(
            "submitReplyButton"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (createButton) {

        createButton.addEventListener(
            "click",
            openTopicForm
        );

    }


    if (closeTopicButton) {

        closeTopicButton.addEventListener(
            "click",
            closeTopicForm
        );

    }


    if (closeViewButton) {

        closeViewButton.addEventListener(
            "click",
            closeTopicView
        );

    }


    if (submitTopicButton) {

        submitTopicButton.addEventListener(
            "click",
            createTopic
        );

    }


    if (submitReplyButton) {

        submitReplyButton.addEventListener(
            "click",
            addReply
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            searchTopics
        );

    }


    window.addEventListener(
        "click",
        function (event) {

            const topicModal =
                document.getElementById(
                    "topicModal"
                );

            const topicViewModal =
                document.getElementById(
                    "topicViewModal"
                );


            if (
                event.target === topicModal
            ) {

                closeTopicForm();

            }


            if (
                event.target === topicViewModal
            ) {

                closeTopicView();

            }

        }
    );
}


/* =====================================================
   LOAD TOPICS
   ===================================================== */

async function loadTopics() {

    const container =
        document.getElementById(
            "topics"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading">
            در حال دریافت تاپیک‌ها...
        </div>
    `;


    const result =
        await supabaseClient
            .from("topics")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        console.error(
            "LOAD TOPICS ERROR:",
            result.error
        );


        container.innerHTML = `
            <div class="empty">
                دریافت تاپیک‌ها با مشکل مواجه شد.
                <br><br>
                ${escapeHTML(
                    result.error.message
                )}
            </div>
        `;

        return;
    }


    topics =
        result.data || [];


    displayTopics(
        topics
    );
}


/* =====================================================
   DISPLAY TOPICS
   ===================================================== */

function displayTopics(
    list
) {

    const container =
        document.getElementById(
            "topics"
        );

    const count =
        document.getElementById(
            "topicCount"
        );


    if (!container) {
        return;
    }


    if (count) {

        count.textContent =
            toPersianNumber(
                list.length
            ) +
            " تاپیک";

    }


    if (
        !list ||
        list.length === 0
    ) {

        container.innerHTML = `
            <div class="empty">
                هنوز هیچ تاپیکی ساخته نشده است 💜
                <br>
                اولین تاپیک را شما بسازید!
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    list.forEach(
        function (topic) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "topic-card";


            const title =
                escapeHTML(
                    topic.title
                );


            const username =
                escapeHTML(
                    topic.username
                );


            const text =
                String(
                    topic.text || ""
                );


            let preview =
                text.substring(
                    0,
                    140
                );


            if (
                text.length > 140
            ) {

                preview += "...";

            }


            card.innerHTML = `

                <h3>
                    ${title}
                </h3>

                <div class="topic-meta">

                    توسط
                    ${username}

                    •
                    ${formatDate(
                        topic.created_at
                    )}

                </div>

                <div class="topic-preview">

                    ${escapeHTML(
                        preview
                    )}

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    openTopic(
                        topic.id
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );
}


/* =====================================================
   OPEN TOPIC FORM
   ===================================================== */

function openTopicForm() {

    const modal =
        document.getElementById(
            "topicModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "block";


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    const username =
        document.getElementById(
            "username"
        );

    const title =
        document.getElementById(
            "topicTitle"
        );

    const text =
        document.getElementById(
            "topicText"
        );


    if (username) {
        username.value = "";
    }


    if (title) {
        title.value = "";
    }


    if (text) {
        text.value = "";
    }

}


/* =====================================================
   CLOSE TOPIC FORM
   ===================================================== */

function closeTopicForm() {

    const modal =
        document.getElementById(
            "topicModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =====================================================
   CREATE TOPIC
   ===================================================== */

async function createTopic() {

    const usernameInput =
        document.getElementById(
            "username"
        );

    const titleInput =
        document.getElementById(
            "topicTitle"
        );

    const textInput =
        document.getElementById(
            "topicText"
        );


    const username =
        usernameInput.value.trim();


    const title =
        titleInput.value.trim();


    const text =
        textInput.value.trim();


    if (
        !username ||
        !title ||
        !text
    ) {

        alert(
            "لطفاً همه قسمت‌ها را کامل کنید."
        );

        return;
    }


    if (
        username.length > 50
    ) {

        alert(
            "نام شما خیلی طولانی است."
        );

        return;
    }


    if (
        title.length > 150
    ) {

        alert(
            "عنوان تاپیک خیلی طولانی است."
        );

        return;
    }


    if (
        text.length > 5000
    ) {

        alert(
            "متن تاپیک خیلی طولانی است."
        );

        return;
    }


    const button =
        document.getElementById(
            "submitTopicButton"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "در حال ساخت...";

    }


    const result =
        await supabaseClient
            .from("topics")
            .insert({

                username:
                    username,

                title:
                    title,

                text:
                    text

            });


    if (result.error) {

        console.error(
            "CREATE TOPIC ERROR:",
            result.error
        );


        alert(
            "ساخت تاپیک انجام نشد.\n\n" +
            result.error.message
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "ساخت تاپیک";

        }


        return;
    }


    if (button) {

        button.disabled = false;

        button.textContent =
            "ساخت تاپیک";

    }


    closeTopicForm();


    await loadTopics();


    alert(
        "تاپیک با موفقیت ساخته شد 💜"
    );
}


/* =====================================================
   OPEN TOPIC
   ===================================================== */

async function openTopic(
    id
) {

    currentTopicId =
        id;


    const topic =
        topics.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!topic) {
        return;
    }


    const modal =
        document.getElementById(
            "topicViewModal"
        );


    const content =
        document.getElementById(
            "topicContent"
        );


    if (
        !modal ||
        !content
    ) {

        return;

    }


    content.innerHTML = `

        <h2 class="topic-main-title">

            ${escapeHTML(
                topic.title
            )}

        </h2>


        <div class="topic-author">

            توسط
            ${escapeHTML(
                topic.username
            )}

            •
            ${formatDate(
                topic.created_at
            )}

        </div>


        <div class="topic-body">

            ${escapeHTML(
                topic.text
            )}

        </div>

    `;


    modal.style.display =
        "block";


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    await loadReplies(
        id
    );


    const replyName =
        document.getElementById(
            "replyName"
        );


    const replyText =
        document.getElementById(
            "replyText"
        );


    if (replyName) {
        replyName.value = "";
    }


    if (replyText) {
        replyText.value = "";
    }
}


/* =====================================================
   CLOSE TOPIC VIEW
   ===================================================== */

function closeTopicView() {

    const modal =
        document.getElementById(
            "topicViewModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    currentTopicId =
        null;
}


/* =====================================================
   LOAD REPLIES
   ===================================================== */

async function loadReplies(
    topicId
) {

    const container =
        document.getElementById(
            "replies"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading">
            در حال دریافت پاسخ‌ها...
        </div>
    `;


    const result =
        await supabaseClient
            .from("replies")
            .select("*")
            .eq(
                "topic_id",
                topicId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "LOAD REPLIES ERROR:",
            result.error
        );


        container.innerHTML = `
            <div class="empty">
                دریافت پاسخ‌ها انجام نشد.
                <br><br>
                ${escapeHTML(
                    result.error.message
                )}
            </div>
        `;

        return;
    }


    const replies =
        result.data || [];


    if (
        replies.length === 0
    ) {

        container.innerHTML = `
            <div class="empty">
                هنوز پاسخی ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    replies.forEach(
        function (reply) {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "reply";


            element.innerHTML = `

                <strong>

                    ${escapeHTML(
                        reply.username
                    )}

                </strong>


                <small>

                    ${formatDate(
                        reply.created_at
                    )}

                </small>


                <div>

                    ${escapeHTML(
                        reply.text
                    )}

                </div>

            `;


            container.appendChild(
                element
            );

        }
    );
}


/* =====================================================
   ADD REPLY
   ===================================================== */

async function addReply() {

    if (!currentTopicId) {

        alert(
            "تاپیکی انتخاب نشده است."
        );

        return;
    }


    const nameInput =
        document.getElementById(
            "replyName"
        );

    const textInput =
        document.getElementById(
            "replyText"
        );


    const username =
        nameInput.value.trim();


    const text =
        textInput.value.trim();


    if (
        !username ||
        !text
    ) {

        alert(
            "لطفاً نام و متن پاسخ را وارد کنید."
        );

        return;
    }


    if (
        username.length > 50
    ) {

        alert(
            "نام شما خیلی طولانی است."
        );

        return;
    }


    if (
        text.length > 2000
    ) {

        alert(
            "پاسخ خیلی طولانی است."
        );

        return;
    }


    const button =
        document.getElementById(
            "submitReplyButton"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "در حال ارسال...";

    }


    const result =
        await supabaseClient
            .from("replies")
            .insert({

                topic_id:
                    currentTopicId,

                username:
                    username,

                text:
                    text

            });


    if (result.error) {

        console.error(
            "ADD REPLY ERROR:",
            result.error
        );


        alert(
            "ارسال پاسخ انجام نشد.\n\n" +
            result.error.message
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "ارسال پاسخ";

        }


        return;
    }


    if (button) {

        button.disabled = false;

        button.textContent =
            "ارسال پاسخ";

    }


    textInput.value = "";


    await loadReplies(
        currentTopicId
    );


    await loadTopics();


    alert(
        "پاسخ با موفقیت ارسال شد 💜"
    );
}


/* =====================================================
   SEARCH
   ===================================================== */

function searchTopics() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    const query =
        input.value
            .trim()
            .toLowerCase();


    if (!query) {

        displayTopics(
            topics
        );

        return;
    }


    const filtered =
        topics.filter(
            function (topic) {

                const title =
                    String(
                        topic.title || ""
                    ).toLowerCase();


                const text =
                    String(
                        topic.text || ""
                    ).toLowerCase();


                const username =
                    String(
                        topic.username || ""
                    ).toLowerCase();


                return (
                    title.includes(query) ||
                    text.includes(query) ||
                    username.includes(query)
                );

            }
        );


    displayTopics(
        filtered
    );
}


/* =====================================================
   DATE
   ===================================================== */

function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    const value =
        new Date(date);


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return "";

    }


    return value.toLocaleDateString(
        "fa-IR"
    );
}


/* =====================================================
   PERSIAN NUMBERS
   ===================================================== */

function toPersianNumber(
    number
) {

    return String(number).replace(
        /\d/g,
        function (digit) {

            return "۰۱۲۳۴۵۶۷۸۹"[
                digit
            ];

        }
    );
}


/* =====================================================
   SECURITY
   ===================================================== */

function escapeHTML(
    value
) {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
