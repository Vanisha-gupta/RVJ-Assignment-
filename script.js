const URL = 'https://gorest.co.in/public-api/users';
const TOKE = '98e07e2b8850eb69498d04a65e8b62777bd7f4bcc241589befe2317d5e7c0dee';

let currentPage = 1;
const ITEMS_PER_PAGE = 7;

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers(currentPage);
    initializeModal();
});

function fetchUsers(page) {
    fetch(`${URL}?page=${page}`, {
        headers: {
            'Authorization': `Bearer ${TOKE}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const users = data.data;
        displayUsers(users, page);
        configurePagination(data.meta.pagination);
    })
    .catch(error => console.error('Error fetching users:', error));
}

function displayUsers(users, page) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
            <td>${user.name}</td>
            <td class="actions">
                <a href="#" onclick="viewUser(${user.id})">Show</a>
                <a href="#" onclick="editUser(${user.id})">Edit</a>
                <a href="#" onclick="deleteUser(${user.id})">Delete</a>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

function configurePagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (pagination.page > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = '<<';
        prevButton.onclick = () => fetchUsers(pagination.page - 1);
        paginationDiv.appendChild(prevButton);
    }

    for (let i = 1; i <= pagination.pages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        if (i === pagination.page) {
            pageButton.disabled = true;
        }
        pageButton.onclick = () => fetchUsers(i);
        paginationDiv.appendChild(pageButton);
    }

    if (pagination.page < pagination.pages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = '>>';
        nextButton.onclick = () => fetchUsers(pagination.page + 1);
        paginationDiv.appendChild(nextButton);
    }
}

document.getElementById('newUserBtn').addEventListener('click', () => {
    openUserModal();
});

function openUserModal(user = {}) {
    const modal = document.getElementById('userFormModal');
    const form = document.getElementById('userForm');

    form.name.value = user.name || '';
    form.email.value = user.email || '';
    form.gender.value = user.gender || 'male';
    form.status.checked = user.status === 'active';
    form.userId.value = user.id || '';

    modal.style.display = 'block';
}

function initializeModal() {
    const modal = document.getElementById('userFormModal');
    const closeButton = document.getElementsByClassName('close')[0];
    const form = document.getElementById('userForm');

    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    form.onsubmit = (event) => {
        event.preventDefault();
        const user = {
            name: form.name.value,
            email: form.email.value,
            gender: form.gender.value,
            status: form.status.checked ? 'active' : 'inactive'
        };
        const userId = form.userId.value;

        if (userId) {
            updateUser(userId, user);
        } else {
            createUser(user);
        }
    };
}

function createUser(user) {
    fetch(URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKE}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(() => {
        fetchUsers(currentPage);
        closeModal();
    })
    .catch(error => console.error('Error creating user:', error));
}

function updateUser(userId, user) {
    fetch(`${URL}/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${TOKE}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(() => {
        fetchUsers(currentPage);
        closeModal();
    })
    .catch(error => console.error('Error updating user:', error));
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    fetch(`${URL}/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${TOKE}`
        }
    })
    .then(() => {
        fetchUsers(currentPage);
    })
    .catch(error => console.error('Error deleting user:', error));
}

function viewUser(userId) {
    fetch(`${URL}/${userId}`, {
        headers: {
            'Authorization': `Bearer ${TOKE}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const user = data.data;
        alert(`Name: ${user.name}\nEmail: ${user.email}\nGender: ${user.gender}\nStatus: ${user.status}`);
    })
    .catch(error => console.error('Error fetching user details:', error));
}

function editUser(userId) {
    fetch(`${URL}/${userId}`, {
        headers: {
            'Authorization': `Bearer ${TOKE}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const user = data.data;
        openUserModal(user);
    })
    .catch(error => console.error('Error fetching user details:', error));
}

function closeModal() {
    const modal = document.getElementById('userFormModal');
    modal.style.display = 'none';
}
